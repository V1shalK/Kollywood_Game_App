// script.js

// This code ensures the script runs after the entire HTML document is loaded
// This code will run on every page that includes this script file.
document.addEventListener('DOMContentLoaded', () => {

    // First, check for the token to make sure the user is logged in.
    const token = localStorage.getItem("token");

    if (!token) {
        // If there is no token, redirect the user back to the login page.
        // This is a basic form of route protection.
        if (window.location.pathname !== '/login.html') {
             window.location.href = "login.html";
        }
        return; // Stop execution if not logged in
    }

    // If the token exists, get the username from local storage.
    const username = localStorage.getItem("username");

    // This is the key part: find the element by its ID.
    // We can re-use the same ID across multiple pages for simplicity.
    const usernameDisplayElement = document.getElementById("profilebtn");

    if (usernameDisplayElement && username) {
        // Update the text content of the found element with the username.
        usernameDisplayElement.textContent = username;
    } else {
        // Fallback or error handling if the element is not found
        // or the username is missing from local storage.
        if (usernameDisplayElement) {
            usernameDisplayElement.textContent = 'Guest';
        }
    }
});

// ----- Mode Page -----
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
        window.location.href = selectedMode === "single" ? "game.html" : "mode2.html";
    });
}

// ----- Mode2 Page -----
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



// -------------------- GAME LOGIC --------------------
// -------------------- GAME DATA --------------------

// Correct answers per category
const answers = {
    hero: "Vijay",
    heroine: "Trisha",
    movie: "Leo",
    song: "Naa Ready"
};

// Track which table cells are already guessed correctly
const guessedCells = {
    hero: false,
    heroine: false,
    movie: false,
    song: false
};

// Footer text for KOLLYWOOD
let footer = document.querySelector(".Lives");
let kollyLetters = footer.innerText.split(""); 
let strikeIndex = 0; 

// -------------------- POPUP CREATION --------------------
const popup = document.createElement('div');
popup.id = 'popup';
popup.style.cssText = `
    display:none; 
    position:fixed; top:0; left:0; width:100%; height:100%;
    background-color: rgba(0,0,0,0.3); 
    backdrop-filter: blur(5px);
    justify-content:center; align-items:center; z-index:10;
`;

popup.innerHTML = `
    <div style="
        background: rgba(255,255,255,0.25); 
        backdrop-filter: blur(8px); 
        padding: 40px 50px; 
        border-radius: 20px; 
        display:flex; 
        flex-direction: column; 
        align-items:center; 
        justify-content:center; 
        gap:15px;
        min-width: 500px; 
        max-width: 90%;
        font-size: 1.2rem;
        color: #000;
    ">
        <!-- Popup text -->
        <span id="popup-text" style="font-size:1.3rem;">Enter your guess:</span>

        <!-- Input + Submit button in one overlapping container -->
        <div style="position: relative; width: 100%; max-width: 400px;">
            <input type="text" id="user-input" placeholder="Type your Guess" style="
                width: 100%; 
                font-size:1.5rem; 
                padding:12px 20px; 
                border-radius:24px; 
                border:none;
                outline:none;
            ">
            <button id="submit-guess" style="
                position: absolute;
                top: 50%;
                right: 0;
                transform: translateY(-50%);
                padding:18px 20px; 
                font-size:1rem; 
                cursor:pointer; 
                border:none; 
                border-radius:24px; 
                background-color:#68B087; 
                color:white;
            ">Submit</button>
        </div>
    </div>
`;

document.body.appendChild(popup);

// Grab popup elements
const popupText = document.getElementById('popup-text');
const userInput = document.getElementById('user-input');
const submitBtn = document.getElementById('submit-guess');

let currentCategory = ""; // tracks which cell category is being guessed

// -------------------- FUNCTIONS --------------------

// Open popup
function openPopup(event) {
    currentCategory = event.target.className; // hero, heroine, movie, song
    if(guessedCells[currentCategory]) return; // already guessed correctly
    popup.style.display = 'flex';
    userInput.value = '';
    userInput.focus();
    popupText.innerText = `Enter the ${currentCategory} name:`;
    popupText.style.color = "#000";
}

// Check guess
function checkGuess() {
    const guess = userInput.value.trim();
    if(guess.length === 0){
        alert("Please type your guess!");
        return;
    }

    if(guess.toUpperCase() === answers[currentCategory].toUpperCase()){
        // Correct guess
        popupText.innerText = "🎉 Correct!";
        popupText.style.color = "green";

        // Add green horizontal dash to the cell without changing letter color
        const cell = document.querySelector(`.${currentCategory}`);
        cell.innerHTML = `<span style="position:relative;">
            ${cell.innerText}
            <span style="position:absolute; top:50%; left:0; width:100%; height:15px; background-color:green; display:block;"></span>
        </span>`;

        guessedCells[currentCategory] = true; // mark as guessed
    } else {
        // Wrong guess → strike one letter in KOLLYWOOD with red line
        popupText.innerText = "❌ Wrong! Try again.";
        popupText.style.color = "red";

        if(strikeIndex < kollyLetters.length){
            kollyLetters[strikeIndex] = `<span style="text-decoration: line-through; color: red;">${kollyLetters[strikeIndex]}</span>`;
            footer.innerHTML = kollyLetters.join("");
            strikeIndex++;
        }
    }

    // Check win condition
    const allGuessed = Object.values(guessedCells).every(v => v === true);
    if(allGuessed){
        setTimeout(() => {
            if(confirm("🎉 Congratulations! You won! Do you want to play again?")){
                location.reload();
            }
        }, 300);
        return;
    }

    // Check lose condition
    if(strikeIndex >= 9){
        setTimeout(() => {
            if(confirm("😢 Sorry! You lost. Do you want to play again?")){
                location.reload();
            }
        }, 300);
        return;
    }

    // Close popup automatically after submission (short delay to show feedback)
    setTimeout(() => {
        popup.style.display = 'none';
    }, 500);
}

// -------------------- EVENT LISTENERS --------------------

// Table cells click
const tableCells = document.querySelectorAll(".Plustable td");
tableCells.forEach(cell => {
    cell.addEventListener('click', openPopup);
});

// Popup submit button
submitBtn.addEventListener('click', checkGuess);

// Optional: close popup if click outside content
popup.addEventListener('click', (e) => {
    if(e.target === popup){
        popup.style.display = 'none';
    }
});

