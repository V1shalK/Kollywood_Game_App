// This code runs after the entire HTML document is loaded, ensuring all elements are available.
document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------------------------------------
    // Common Logic for all Pages (User Authentication, Profile Display)
    // ----------------------------------------------------------------------------------
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const usernameDisplayElement = document.getElementById("profilebtn");

    if (usernameDisplayElement && username) {
        usernameDisplayElement.textContent = username;
    } else if (usernameDisplayElement) {
        usernameDisplayElement.textContent = 'Guest';
    }

    if (!token && window.location.pathname !== '/login.html') {
        window.location.href = "login.html";
        return;
    }

    // ----------------------------------------------------------------------------------
    // Mode Selection Logic (for Mode Page)
    // ----------------------------------------------------------------------------------
    const singlePlayer = document.getElementById("single-player");
    const multiPlayer = document.getElementById("multi-player");
    const nextModeBtn = document.getElementById("next-btn-mode");

    if (singlePlayer && multiPlayer && nextModeBtn) {
        let selectedMode = null;

        singlePlayer.addEventListener("click", () => {
            selectedMode = "single";
            singlePlayer.classList.add("selected");
            multiPlayer.classList.remove("selected");
        });

        multiPlayer.addEventListener("click", () => {
            selectedMode = "multi";
            multiPlayer.classList.add("selected");
            singlePlayer.classList.remove("selected");
        });

        nextModeBtn.addEventListener("click", () => {
            if (!selectedMode) {
                alert("Please select a mode first!");
                return;
            }
            window.location.href = selectedMode === "single" ? "game.html" : "game_custom.html";
        });
    }

    // ----------------------------------------------------------------------------------
    // Mode 2 Selection Logic (for Mode2 Page)
    // ----------------------------------------------------------------------------------
    const systemBtn = document.getElementById("system-btn");
    const customBtn = document.getElementById("custom-btn");
    const nextMode2Btn = document.getElementById("next-btn");

    if (systemBtn && customBtn && nextMode2Btn) {
        let selectedMode2 = null;

        systemBtn.addEventListener("click", () => {
            selectedMode2 = "system";
            systemBtn.classList.add("selected");
            customBtn.classList.remove("selected");
        });

        customBtn.addEventListener("click", () => {
            selectedMode2 = "custom";
            customBtn.classList.add("selected");
            systemBtn.classList.remove("selected");
        });

        nextMode2Btn.addEventListener("click", () => {
            if (!selectedMode2) {
                alert("Please select an option first!");
                return;
            }
            window.location.href = "game.html";
        });
    }

    // ----------------------------------------------------------------------------------
    // Game Logic (Only runs on game.html)
    // ----------------------------------------------------------------------------------
    if (window.location.pathname.endsWith('/game.html')) {
        const BASE_URL = 'http://localhost:3000';
        
        let correctData = null;
        let usedIds = JSON.parse(localStorage.getItem('used_game_ids')) || [];
        
        let score = 0; // New: Initialize score
        const scoreDisplay = document.querySelector(".game_score"); // New: Get score button

        const guessedCells = {
            hero: false,
            heroine: false,
            movie: false,
            song: false
        };

        const footer = document.querySelector(".Lives");
        let kollyLetters = footer.innerText.split(""); 
        let strikeIndex = 0; 

        // --- Timer Logic ---
        const countdownOverlay = document.getElementById('countdown-overlay');
        const countdownNumber = document.getElementById('countdown-number');
        const mainTimerDisplay = document.getElementById('main-timer-display');
        const minutesDisplay = document.getElementById('minutes');
        const secondsDisplay = document.getElementById('seconds');
        let countdown = 3;
        let totalSeconds = 5 * 60;

        // Function to update the score display
        function updateScoreDisplay() {
            scoreDisplay.textContent = `Score: ${score}`;
        }

        // Function to start the main 5-minute timer
        function startMainTimer() {
            mainTimerDisplay.style.display = 'flex';
            const timerInterval = setInterval(() => {
                if (totalSeconds <= 0) {
                    clearInterval(timerInterval);
                    endGame("Sorry, time's up!");
                    return;
                }
                totalSeconds--;
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                minutesDisplay.textContent = String(minutes).padStart(2, '0');
                secondsDisplay.textContent = String(seconds).padStart(2, '0');
            }, 1000);
        }

        // --- Popup Creation ---
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
            <div style="
                background: rgba(255,255,255,0.25); 
                backdrop-filter: blur(8px); 
                padding: 40px 50px; 
                border-radius: 16px; 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: center; 
                gap: 15px;
                min-width: 440px; 
                max-width: 90%;
                font-size: 1.2rem;
                color: #000;
            ">
                <span id="popup-text" style="font-size: 1.3rem;">Enter your guess:</span>
                <div style="position: relative; width: 100%; max-width: 400px;">
                    <input type="text" id="user-input" placeholder="Type your Guess" style="
                        width: 100%; 
                        font-size: 1.5rem; 
                        padding: 12px 20px; 
                        border-radius: 24px; 
                        border: none;
                        outline: none;
                    ">
                    <button id="submit-guess" style="
                        position: absolute;
                        top: 50%;
                        right: 0;
                        transform: translateY(-50%);
                        padding: 18px 20px; 
                        font-size: 1rem; 
                        cursor: pointer; 
                        border: none; 
                        border-radius: 24px; 
                        background-color: #68B087; 
                        color: white;
                    ">Submit</button>
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

        // New function to handle the end of the game
        function endGame(message) {
            hideMessage();
            localStorage.removeItem('currentGameData'); // Reset for the next game
            showMessage(message, true);
        }

        // New function to check for win condition and handle it
        function checkWin() {
            const allGuessed = Object.values(guessedCells).every(v => v === true);
            if (allGuessed) {
                endGame(`🎉 Congratulations! You won with a score of ${score}! Do you want to play again?`);
                return true;
            }
            return false;
        }

        // Fetches a new, random, and unique game entry from the backend.
        async function getNewGameData() {
            const storedData = localStorage.getItem('currentGameData');
            if (storedData) {
                correctData = JSON.parse(storedData);
                console.log("Using stored game data:", correctData);
                displayClues();
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                console.error("No token found. Please log in.");
                return;
            }

            const excludedIdsString = usedIds.join(',');

            try {
                const response = await fetch(`${BASE_URL}/api/gamedata/random?exclude_ids=${excludedIdsString}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const result = await response.json();
                
                if (response.ok) {
                    correctData = result.data;
                    localStorage.setItem('currentGameData', JSON.stringify(correctData)); // Store the new data
                    usedIds.push(correctData.id);
                    localStorage.setItem('used_game_ids', JSON.stringify(usedIds));
                    
                    console.log("Fetched new data:", correctData);
                    displayClues();
                } else {
                    showMessage(result.error || 'Failed to fetch new data. All data might be used.');
                }
            } catch (err) {
                console.error("Network error:", err);
                showMessage("Network error. Please check the server connection.");
            }
        }
        
        function displayClues() {
            if (correctData) {
                document.querySelector('.hero').textContent = correctData.hero[0].toUpperCase();
                document.querySelector('.heroine').textContent = correctData.heroine[0].toUpperCase();
                document.querySelector('.movie').textContent = correctData.movie[0].toUpperCase();
                document.querySelector('.song').textContent = Array.isArray(correctData.song) ? correctData.song[0][0].toUpperCase() : correctData.song[0].toUpperCase();
            }
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

        function openPopup(event) {
            currentCategory = event.target.className; 
            if(guessedCells[currentCategory]) return;
            
            showMessage(`Enter the ${currentCategory} name:`);
            popupText.style.color = "#000";
            userInput.value = '';
            userInput.focus();
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
        cell.style.textDecoration = "line-through";
        cell.style.color = "green";
        guessedCells[currentCategory] = true;

        // ✅ WIN CHECK
        if (Object.values(guessedCells).every(val => val === true)) {
            // 🛑 Don't hide popup here — show confirm buttons instead
            setTimeout(() => endGamePopup("🎉 You guessed all correctly! Play again?"), 500);
            return; // ⛔ prevents auto-closing
        }
    } else {
        popupText.innerText = "❌ Wrong!";
        popupText.style.color = "red";

        if (strikeIndex < kollyLetters.length) {
            kollyLetters[strikeIndex] =
                `<span style="text-decoration: line-through; color: red; display:inline-block;">
                ${kollyLetters[strikeIndex]}</span>`;
            footer.innerHTML = kollyLetters.join("");
            strikeIndex++;
        }

        // ✅ LOSS CHECK
        if (strikeIndex >= kollyLetters.length) {
            // 🛑 Don't hide popup here — show confirm buttons instead
            setTimeout(() => endGamePopup("😢 You lost! Play again?"), 500);
            return; // ⛔ prevents auto-closing
        }
    }

    // ✅ Only hide popup if this was just a regular guess (not game over)
    setTimeout(hideMessage, 500);
}


        // --- Event Listeners ---
        getNewGameData();

        const tableCells = document.querySelectorAll(".Plustable td");
        tableCells.forEach(cell => {
            cell.addEventListener('click', openPopup);
        });

        if (submitBtn) {
            submitBtn.addEventListener('click', checkGuess);
        }
        
        if (confirmYesBtn) {
            confirmYesBtn.addEventListener('click', () => {
                location.reload();
            });
        }

        if (confirmNoBtn) {
            confirmNoBtn.addEventListener('click', () => {
                // Exit or redirect to main menu
                window.location.href = "mode.html";
            });
        }

        if (popup) {
            popup.addEventListener('click', (e) => {
                if(e.target === popup){
                    hideMessage();
                }
            });
        }

        // Function to start the main 5-minute timer
function startMainTimer() {
    mainTimerDisplay.style.display = 'flex';
    const timerInterval = setInterval(() => {
        if (totalSeconds <= 0) {
            clearInterval(timerInterval);
            // 🔥 Added end game popup when time runs out
            endGame("⏳ Time's up! Do you want to play again?");
            return;
        }
        totalSeconds--;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        minutesDisplay.textContent = String(minutes).padStart(2, '0');
        secondsDisplay.textContent = String(seconds).padStart(2, '0');
    }, 1000);
}


        // ----------------------------------------------------------------------------------
        // Timer Logic
        // ----------------------------------------------------------------------------------
        // The initial 3-second countdown that starts on page load
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown >= 0) {
                countdownNumber.textContent = countdown;
            }

            if (countdown === 0) {
                clearInterval(countdownInterval);
                countdownOverlay.style.display = 'none';
                startMainTimer();
            }
        }, 1000);
    }
});