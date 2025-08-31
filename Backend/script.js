const BASE_URL = "http://localhost:3000"; // backend URL
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const messageDiv = document.getElementById("message");

// -----------------------
// Signup
// -----------------------
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
    console.log("Signup response:", data);

    if (data.user) {
      messageDiv.style.color = "green";
      messageDiv.innerText = "Signup successful! You can now log in.";
    } else {
      messageDiv.style.color = "red";
      messageDiv.innerText = data.error || "Signup failed";
    }
  } catch (err) {
    console.error(err);
    messageDiv.style.color = "red";
    messageDiv.innerText = "Error connecting to server";
  }
});

// -----------------------
// Login
// -----------------------