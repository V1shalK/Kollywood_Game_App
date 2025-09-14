// mode.js
document.addEventListener('DOMContentLoaded', () => {
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
});
