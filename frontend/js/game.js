// game.js (updated for Render backend)
document.addEventListener('DOMContentLoaded', () => {
    const BASE_URL = "https://kollywood-game-backend.onrender.com";
    
    let correctData = null;
    let usedIds = JSON.parse(localStorage.getItem('used_game_ids')) || [];
    let score = 0;
    let strikeIndex = 0;

    const scoreDisplay = document.querySelector(".game_score");
    const footer = document.querySelector(".Lives");
    let kollyLetters = footer.innerText.split("");

    const countdownOverlay = document.getElementById('countdown-overlay');
    const countdownNumber = document.getElementById('countdown-number');
    const mainTimerDisplay = document.getElementById('main-timer-display');
    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');
    let countdown = 3;
    let totalSeconds = 5 * 60;

    const guessedCells = { hero: false, heroine: false, movie: false, song: false };

    // --- Popup Setup ---
    const popup = document.createElement('div');
    popup.id = 'popup';
    popup.style.cssText = `
        display: none;
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0,0,0,0.3);
        backdrop-filter: blur(5px);
        justify-content: center; align-items: center; z-index: 10;
        transition: opacity 0.3s ease;
        opacity: 0;
    `;
    popup.innerHTML = `
        <div style="background: rgba(255,255,255,0.25); backdrop-filter: blur(8px); padding: 40px 50px; border-radius: 20px; display: flex; flex-direction: column; align-items: center; gap: 15px; min-width: 500px; max-width: 90%; font-size: 1.2rem; color: #000;">
            <span id="popup-text" style="font-size: 1.3rem;">Enter your guess:</span>
            <div style="position: relative; width: 100%; max-width: 400px;">
                <input type="text" id="user-input" placeholder="Type your Guess" style="width: 100%; font-size: 1.5rem; padding: 12px 20px; border-radius: 24px; border: none; outline: none;">
                <button id="submit-guess" style="position: absolute; top: 50%; right: 0; transform: translateY(-50%); padding: 18px 20px; font-size: 1rem; cursor: pointer; border: none; border-radius: 24px; background-color: #68B087; color: white;">Submit</button>
            </div>
            <div id="confirm-buttons" style="display: none; margin-top: 10px;">
                <button id="confirm-yes" style="padding: 10px 20px; margin: 0 5px; cursor: pointer; border: none; background-color: #68B087; color: white; border-radius: 10px;">Play Again</button>
                <button id="confirm-no" style="padding: 10px 20px; margin: 0 5px; cursor: pointer; border: none; background-color: #d32f2f; color: white; border-radius: 10px;">Exit</button>
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    const popupText = document.getElementById('popup-text');
    const userInput = document.getElementById('user-input');
    const submitBtn = document.getElementById('submit-guess');
    const confirmButtons = document.getElementById('confirm-buttons');
    const confirmYesBtn = document.getElementById('confirm-yes');
    const confirmNoBtn = document.getElementById('confirm-no');

    let currentCategory = "";

    function updateScoreDisplay() {
        if (scoreDisplay) scoreDisplay.textContent = `Score: ${score}`;
    }

    function showMessage(message, isConfirm = false) {
        popupText.innerText = message;
        userInput.style.display = isConfirm ? 'none' : 'block';
        submitBtn.style.display = isConfirm ? 'none' : 'block';
        confirmButtons.style.display = isConfirm ? 'flex' : 'none';
        popup.style.display = 'flex';
        setTimeout(() => popup.style.opacity = 1, 10);
    }

    function hideMessage() {
        popup.style.opacity = 0;
        setTimeout(() => popup.style.display = 'none', 300);
    }

    async function endGame(message) {
        try {
            const token = localStorage.getItem('token');
            const username = localStorage.getItem('username');

            if (username && typeof score === 'number' && score > 0) {
                const response = await fetch(`${BASE_URL}/api/users/score`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ username, score })
                });

                const result = await response.json().catch(() => ({ error: 'Invalid JSON response' }));

                if (response.ok && result.newScore !== undefined) {
                    const userScoreElement = document.getElementById("userscore");
                    if (userScoreElement) userScoreElement.textContent = `Score: ${result.newScore}`;
                }
            }
        } catch (err) {
            console.error("Failed to update score on server:", err);
        } finally {
            localStorage.removeItem('currentGameData');
            showMessage(message, true);
        }
    }

    function openPopup(event) {
        currentCategory = event.target.className;
        if (guessedCells[currentCategory]) return;
        showMessage(`Enter the ${currentCategory} name:`);
        popupText.style.color = "#000";
        userInput.value = '';
        userInput.focus();
    }

    async function getNewGameData() {
        const storedData = localStorage.getItem('currentGameData');
        if (storedData) {
            correctData = JSON.parse(storedData);
            displayClues();
            return;
        }
        const excludedIdsString = usedIds.join(',');
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${BASE_URL}/api/gamedata/random?exclude_ids=${excludedIdsString}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (response.ok) {
                correctData = result.data;
                localStorage.setItem('currentGameData', JSON.stringify(correctData));
                usedIds.push(correctData.id);
                localStorage.setItem('used_game_ids', JSON.stringify(usedIds));
                displayClues();
            } else {
                showMessage(result.error || 'Failed to fetch new data.');
            }
        } catch {
            showMessage("Network error. Please check server connection.");
        }
    }

    function displayClues() {
        if (!correctData) return;
        document.querySelector('.hero').textContent = correctData.hero[0].toUpperCase();
        document.querySelector('.heroine').textContent = correctData.heroine[0].toUpperCase();
        document.querySelector('.movie').textContent = correctData.movie[0].toUpperCase();
        document.querySelector('.song').textContent = Array.isArray(correctData.song) ? correctData.song[0][0].toUpperCase() : correctData.song[0].toUpperCase();
    }

    function checkGuess() {
        const guess = userInput.value.trim();
        if (!guess) {
            showMessage("Please type your guess!");
            return;
        }
        let correctAnswer = correctData[currentCategory];
        if (guess.toUpperCase() === correctAnswer.toUpperCase()) {
            popupText.innerText = "🎉 Correct!";
            popupText.style.color = "green";
            score += 25;
            updateScoreDisplay();
            const cell = document.querySelector(`.${currentCategory}`);
            if (cell) {
                cell.style.textDecoration = "line-through";
                cell.style.color = "green";
            }
            guessedCells[currentCategory] = true;

            if (Object.values(guessedCells).every(v => v)) {
                endGame(`🎉 You won! Score: ${score}`);
                return;
            }
        } else {
            popupText.innerText = "❌ Wrong!";
            popupText.style.color = "red";
            if (strikeIndex < kollyLetters.length) {
                kollyLetters[strikeIndex] = `<span style="text-decoration: line-through; color: red;">${kollyLetters[strikeIndex]}</span>`;
                footer.innerHTML = kollyLetters.join("");
                strikeIndex++;
            }
            if (strikeIndex >= kollyLetters.length) {
                endGame("😢 You lost!");
                return;
            }
        }
        setTimeout(hideMessage, 500);
    }

    function startMainTimer() {
        mainTimerDisplay.style.display = 'flex';
        const timerInterval = setInterval(() => {
            if (totalSeconds <= 0) {
                clearInterval(timerInterval);
                endGame("⏳ Time's up!");
                return;
            }
            totalSeconds--;
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            minutesDisplay.textContent = String(minutes).padStart(2, '0');
            secondsDisplay.textContent = String(seconds).padStart(2, '0');
        }, 1000);
    }

    getNewGameData();

    document.querySelectorAll(".Plustable td").forEach(cell => {
        cell.addEventListener('click', openPopup);
    });

    submitBtn.addEventListener('click', checkGuess);

    confirmYesBtn.addEventListener('click', () => {
        localStorage.removeItem('currentGameData');
        location.reload();
    });

    confirmNoBtn.addEventListener('click', () => window.location.href = "mode.html");

    popup.addEventListener('click', e => { if (e.target === popup) hideMessage(); });

    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown >= 0) countdownNumber.textContent = countdown;
        if (countdown === 0) {
            clearInterval(countdownInterval);
            countdownOverlay.style.display = 'none';
            startMainTimer();
        }
    }, 1000);
});
