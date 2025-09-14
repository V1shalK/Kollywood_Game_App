document.addEventListener('DOMContentLoaded', () => {
    const guessbox = document.querySelector('.Guessbox');
    const popupOverlay = document.getElementById('input-popup');
    const submitButton = document.getElementById('submit-custom-words');

    // Countdown elements
    const startCountdownOverlay = document.getElementById('start-countdown-overlay');
    const startCountdownNumber = document.getElementById('start-countdown-number');

    // Table cells
    const heroCell = document.querySelector('.hero');
    const heroineCell = document.querySelector('.heroine');
    const movieCell = document.querySelector('.movie');
    const songCell = document.querySelector('.song');

    // Main game timer
    const mainTimerDisplay = document.getElementById('main-timer-display');
    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');
    let mainTimerInterval = null;
    let totalSeconds = 5 * 60;

    function startMainTimer() {
        mainTimerDisplay.style.display = 'flex';
        mainTimerInterval = setInterval(() => {
            if (totalSeconds <= 0) {
                clearInterval(mainTimerInterval);
                console.log("Time's up!");
                return;
            }
            totalSeconds--;
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            minutesDisplay.textContent = String(minutes).padStart(2, '0');
            secondsDisplay.textContent = String(seconds).padStart(2, '0');
        }, 1000);
    }

    // Show popup for input
    guessbox.addEventListener('click', () => {
        popupOverlay.style.display = 'flex';
        setTimeout(() => popupOverlay.classList.add('visible'), 10);
    });

    submitButton.addEventListener('click', () => {
        const heroInput = document.getElementById('hero-input').value.trim();
        const heroineInput = document.getElementById('heroine-input').value.trim();
        const movieInput = document.getElementById('movie-input').value.trim();
        const songInput = document.getElementById('song-input').value.trim();

        if (!heroInput || !heroineInput || !movieInput || !songInput) {
            alert('Please fill out all the fields.');
            return;
        }

        window.correctData = {
            hero: heroInput,
            heroine: heroineInput,
            movie: movieInput,
            song: songInput
        };

        heroCell.textContent = heroInput[0].toUpperCase();
        heroineCell.textContent = heroineInput[0].toUpperCase();
        movieCell.textContent = movieInput[0].toUpperCase();
        songCell.textContent = songInput[0].toUpperCase();

        popupOverlay.classList.remove('visible');
        setTimeout(() => popupOverlay.style.display = 'none', 300);

        let startCountdown = 5;
        startCountdownNumber.textContent = startCountdown;
        startCountdownOverlay.style.display = 'flex';
        setTimeout(() => startCountdownOverlay.style.opacity = 1, 10);

        const countdownInterval = setInterval(() => {
            startCountdown--;
            startCountdownNumber.textContent = startCountdown;
            if (startCountdown <= 0) {
                clearInterval(countdownInterval);
                startCountdownOverlay.style.opacity = 0;
                setTimeout(() => {
                    startCountdownOverlay.style.display = 'none';
                    startMainTimer();
                    enableGameLogic(window.correctData);
                }, 500);
            }
        }, 1000);
    });

    function enableGameLogic(userData) {
        let correctData = userData;
        let score = 0;
        const scoreDisplay = document.querySelector(".game_score");
        const guessedCells = { hero: false, heroine: false, movie: false, song: false };

        const footer = document.querySelector(".Lives");
        let kollyLetters = footer.innerText.split("");
        let strikeIndex = 0;

        // Create popup dynamically
        const popup = document.createElement('div');
        popup.id = 'popup';
        popup.style.cssText = `
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(0,0,0,0.3); backdrop-filter: blur(5px);
            justify-content: center; align-items: center; z-index: 10;
            transition: opacity 0.3s ease; opacity: 0;
        `;
        popup.innerHTML = `
            <div style="
                background: rgba(255,255,255,0.25);
                backdrop-filter: blur(8px);
                padding: 40px 50px;
                border-radius: 20px;
                display: flex; flex-direction: column;
                align-items: center; gap: 15px; min-width: 500px;
                font-size: 1.2rem; color: #000;
            ">
                <span id="popup-text" style="font-size: 1.3rem;">Enter your guess:</span>
                <div style="position: relative; width: 100%; max-width: 400px;">
                    <input type="text" id="user-input" placeholder="Type your Guess" style="
                        width: 100%; font-size: 1.5rem; padding: 12px 20px;
                        border-radius: 24px; border: none; outline: none;
                    ">
                    <button id="submit-guess" style="
                        position: absolute; top: 50%; right: 0; transform: translateY(-50%);
                        padding: 18px 20px; font-size: 1rem; cursor: pointer;
                        border: none; border-radius: 24px;
                        background-color: #68B087; color: white;
                    ">Submit</button>
                </div>
                <div id="confirm-buttons" style="display: none; margin-top: 10px;">
                    <button id="confirm-yes" style="padding: 10px 20px; margin: 0 5px;
                        cursor: pointer; border: none; background-color: #68B087;
                        color: white; border-radius: 10px;">Play Again</button>
                    <button id="confirm-no" style="padding: 10px 20px; margin: 0 5px;
                        cursor: pointer; border: none; background-color: #d32f2f;
                        color: white; border-radius: 10px;">Exit</button>
                </div>
            </div>`;
        document.body.appendChild(popup);

        const popupText = document.getElementById('popup-text');
        const userInput = document.getElementById('user-input');
        const submitBtn = document.getElementById('submit-guess');
        const confirmButtons = document.getElementById('confirm-buttons');
        const confirmYesBtn = document.getElementById('confirm-yes');
        const confirmNoBtn = document.getElementById('confirm-no');
        let currentCategory = "";

        function updateScoreDisplay() {
            scoreDisplay.textContent = `Score: ${score}`;
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

        function endGamePopup(message) {
            // ✅ Reuse popup but in confirm mode
            showMessage(message, true);
        }

        function openPopup(event) {
            currentCategory = event.target.className;
            if (guessedCells[currentCategory]) return;
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
                    setTimeout(() => endGamePopup("🎉 You guessed all correctly! Play again?"), 500);
                    return;
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
                    setTimeout(() => endGamePopup("😢 You lost! Play again?"), 500);
                    return;
                }
            }

            setTimeout(hideMessage, 500);
        }

        document.querySelector('.hero').textContent = correctData.hero[0].toUpperCase();
        document.querySelector('.heroine').textContent = correctData.heroine[0].toUpperCase();
        document.querySelector('.movie').textContent = correctData.movie[0].toUpperCase();
        document.querySelector('.song').textContent = correctData.song[0].toUpperCase();

        const tableCells = document.querySelectorAll(".Plustable td");
        tableCells.forEach(cell => cell.addEventListener('click', openPopup));
        submitBtn.addEventListener('click', checkGuess);

        // Replay / Exit buttons
        confirmYesBtn.addEventListener('click', () => location.reload());
        confirmNoBtn.addEventListener('click', () => window.location.href = "mode.html");
        popup.addEventListener('click', (e) => { if (e.target === popup) hideMessage(); });
    }
});
