// login.js
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const messageDiv = document.getElementById("message");

// Your backend URL
const BASE_URL = "http://localhost:3000";

// ---------------- SIGNUP ----------------
// This part is fine, no changes needed here.
if (signupForm) { // Add a check to prevent errors if the form isn't on the page
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
    } catch (err) {
      console.error(err);
      messageDiv.innerText = "Error connecting to server";
    }
  });
}

// ---------------- LOGIN ----------------
// Combine the two login event listeners into a single, clean function
if (loginForm) { // Add a check for the login form
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

      if (res.ok) { // Check for a successful HTTP status code
        messageDiv.innerText = "Login successful!";
        messageDiv.style.color = "green";

        // IMPORTANT: Save both the token AND the username
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.user.username); // <-- This is the key line!

        console.log("Redirecting to the game page...");
        // Redirect to your main game page, e.g., 'game.html'
        // I'll assume your game page is at ./game.html based on your previous code
        window.location.href = "./index.html"; 
        window.localStorage.href = "./mode.html";
      } else {
        // Handle login failure
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