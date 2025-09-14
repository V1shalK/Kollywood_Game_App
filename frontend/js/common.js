document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem("token");
    const usernameDisplayElement = document.getElementById("profilebtn");
    const userScoreElement = document.getElementById("userscore");

    if (!token && window.location.pathname !== '/login.html') {
        window.location.href = "login.html";
        return;
    }

    const BASE_URL = "https://kollywood-game-backend.onrender.com"; // ✅ Updated backend URL

    try {
        const response = await fetch(`${BASE_URL}/api/users/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch user data");

        const data = await response.json();

        if (usernameDisplayElement) {
            usernameDisplayElement.textContent = data.user.username;
        }

        if (userScoreElement) {
            userScoreElement.textContent = `Score: ${data.user.score}`;
        }

    } catch (err) {
        console.error("Error fetching user info:", err);
        if (usernameDisplayElement) usernameDisplayElement.textContent = 'Guest';
        if (userScoreElement) userScoreElement.textContent = 'Score: 0';
    }
});
