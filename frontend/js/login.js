// login.js
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const messageDiv = document.getElementById("message");

// Your deployed backend URL
const BASE_URL = "https://kollywood-game-backend.onrender.com";

// ---------------- SIGNUP ----------------
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("signupUsername").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    try {
      const res = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();
      messageDiv.innerText = data.message || data.error;
      messageDiv.style.color = res.ok ? "green" : "red";
    } catch (err) {
      console.error(err);
      messageDiv.innerText = "Error connecting to server";
      messageDiv.style.color = "red";
    }
  });
}

// ---------------- LOGIN ----------------
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    messageDiv.innerText = ""; // Clear previous messages

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (res.ok) {
        messageDiv.innerText = "Login successful!";
        messageDiv.style.color = "green";

        // Save token and username
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.user.username);

        console.log("Redirecting to the game page...");
        window.location.href = "./index.html"; // Redirect to your main game page
      } else {
        messageDiv.style.color = "red";
        messageDiv.innerText = data.error || "Login failed.";
      }
    } catch (err) {
      console.error(err);
      messageDiv.style.color = "red";
      messageDiv.innerText = "Error connecting to server.";
    }
  });
}
