// -------------------- GAME LOGIC --------------------

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
let kollyLetters = footer.innerText.split(""); // ['K','O','L','L','Y','W','O','O','D']

let strikeIndex = 0; // tracks which letter to strike next

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
        backdrop-filter: blur(10px); 
        padding: 50px 70px; 
        border-radius: 20px; 
        text-align:center; 
        font-size: 1.5rem;
        color: #000;
        position: relative;
        min-width: 350px;
    ">
        <p id="popup-text">Enter your guess:</p>
        <input type="text" id="user-input" placeholder="Type your guess here" style="font-size:1rem; padding:10px; margin-top:20px; width: 80%;">
        <br><br>
        <button id="submit-guess" style="padding:12px 25px; font-size:1rem; cursor:pointer; border:none; border-radius:10px; background-color:#68B087; color:white;">Submit</button>
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

// Optional: close popup if click outside content (can keep or remove)
popup.addEventListener('click', (e) => {
    if(e.target === popup){
        popup.style.display = 'none';
    }
});
