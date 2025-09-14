require("dotenv").config(); // ✅ Load env first

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const pool = require("./db"); // ✅ Your db.js should export a Pool using DATABASE_URL

const app = express();
app.use(cors());
app.use(express.json());

// -----------------------
// DEBUG: Check environment variables
// -----------------------
console.log("🔹 DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Not Set");
console.log("🔹 JWT_SECRET:", process.env.JWT_SECRET ? "✅ Set" : "❌ Not Set");

// -----------------------
// Test DB connection on startup
// -----------------------
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL database");
    client.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message || err);
    process.exit(1); // Stop server if DB connection fails
  }
})();

// -----------------------
// Signup Route
// -----------------------
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );

    res.json({ message: "User registered successfully", user: result.rows[0] });
  } catch (err) {
    console.error("Signup error:", err.message || err);
    res.status(400).json({ error: "Username or email already exists" });
  }
});

// -----------------------
// Login Route
// -----------------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) return res.status(400).json({ error: "Email & password required" });

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: "Invalid email" });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: "Invalid password" });

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET not set!");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (err) {
    console.error("Login error:", err.message || err);
    res.status(500).json({ error: "Server error" });
  }
});

// -----------------------
// Game Data API Route
// -----------------------
app.get("/api/gamedata/random", async (req, res) => {
  try {
    const { exclude_ids } = req.query;
    let queryText = `SELECT * FROM game_data ORDER BY RANDOM() LIMIT 1`;
    let queryValues = [];

    if (exclude_ids) {
      const idsToExclude = exclude_ids.split(",").map(Number);
      queryText = `SELECT * FROM game_data WHERE id <> ANY($1) ORDER BY RANDOM() LIMIT 1`;
      queryValues = [idsToExclude];
    }

    const result = await pool.query(queryText, queryValues);

    if (result.rows.length > 0) {
      res.json({ success: true, data: result.rows[0] });
    } else {
      res.status(404).json({ success: false, error: "No new data available." });
    }
  } catch (error) {
    console.error("Error fetching game data:", error.message || error);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});

// -----------------------
// Update User Score
// -----------------------
app.put("/api/users/score", async (req, res) => {
  const { username, score } = req.body;
  console.log(`Score update request → User: ${username}, Score to Add: ${score}`);

  if (!username || typeof score !== "number") {
    return res.status(400).json({ error: "Username and score are required." });
  }

  try {
    const query = `
      UPDATE users
      SET score = score + $1
      WHERE username = $2
      RETURNING score;
    `;
    const result = await pool.query(query, [score, username]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({
      message: "Score updated successfully",
      newScore: result.rows[0].score,
    });
  } catch (err) {
    console.error("Error updating score:", err.message || err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------
// Get Logged-in User Info
// -----------------------
app.get("/api/users/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      "SELECT username, score FROM users WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("Error fetching user data:", err.message || err);
    res.status(401).json({ error: "Invalid token" });
  }
});

// -----------------------
// Start Server
// -----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
