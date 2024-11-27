const display     = document.getElementById("game-display");
const startButton = document.getElementById("start-button");
const keyboard    = document.getElementById("keyboard");
const lives       = document.getElementById("lives");
const score       = document.getElementById("score");
const buttons     = document.getElementsByClassName("keyboard-button");

let game;
let jsonData;
let currentCharacter;
let currentHint;
let playerScore = 0;
let gameRunning = false;

fetch("./json/words.json")
    .then(function(response) {
        if (response.ok) {
            return response.json();
        }
    })
    .then(function(incomingData) {
        jsonData = incomingData;
    })
    .catch(function() {
        console.log("Error fetching character and hint.");
    })

startButton.addEventListener("click", function() {
    newGame();
    displayScore();
});

window.addEventListener("load", function() {
    animateStartButton();
})

keyboard.addEventListener("click", function(e) {
    if (gameRunning) {
        if (e.target.tagName === "BUTTON") {
            const letter = e.target.value;
            game.guessLetter(letter);
            game.displayWordAndHint();
    
            e.target.classList.add("guessed");
            e.target.setAttribute("disabled", true);
    
            game.displayLives();
        }
    
        if (game.remainingLives === 0) {
            game.gameOver();
        } else if (game.isVictory()) {
            game.victory();
            playerScore++;
            displayScore();
        }
    }
});

// Functions

function getRandomCharacterAndHint() {
    const characterAndHint = jsonData[Math.floor(Math.random() * jsonData.length)];
    currentCharacter = characterAndHint.character.toUpperCase();
    currentHint = characterAndHint.hint;
}

function newGame() {
    getRandomCharacterAndHint();
    game = new HangmarioGame(currentCharacter, currentHint);
    gameRunning = true;
    startButton.style.display = "none";
    game.displayWordAndHint();
    game.displayLives();

    for (button of buttons) {
        button.classList.remove("guessed");
        button.removeAttribute("disabled", false);
    }
}

function displayScore() {
    score.innerHTML = `<img src="./images/coin.png" alt="coin"> x${playerScore}`;
}

function animateStartButton() {
    const interval = 500;
    setInterval(function() {
        if (startButton.style.opacity === "1") {
            startButton.style.opacity = "0.2";
        } else {
            startButton.style.opacity = "1";
        }
    }, interval)
}

// Game class

class HangmarioGame {
    character;
    hint;
    guessedLetters;
    maxLives;
    remainingLives;

    constructor(character, hint) {
        this.character      = character;
        this.hint           = hint;
        this.guessedLetters = [];
        this.maxLives       = 6;
        this.remainingLives = this.maxLives;
    }

    getCurrentWordStatus() {
        let currentWord = [];

        for (let i = 0; i < this.character.length; i++) {
            if (this.guessedLetters.includes(this.character[i])) {
                currentWord[i] = this.character[i];
            } else {
                currentWord[i] = "_";
            }
        }

        return currentWord.join(" ");
    }

    guessLetter(letter) {
        if (this.guessedLetters.includes(letter)) {
            console.log(`${letter} has already been guessed`);
            return;
        }

        let letterFound;

        this.guessedLetters.push(letter);

        for (let i = 0; i < this.character.length; i++) {
            if (letter.toUpperCase() === this.character[i].toUpperCase()) {
                letterFound = true;
            }
        }

        if (!letterFound) {
            this.remainingLives--;
        }
    }
    
    displayLives() {
        const livesList      = document.createElement("ul");
        const fullHeartPath  = "./images/full-heart.png";
        const halfHeartPath  = "./images/half-heart.png";
        const emptyHeartPath = "./images/empty-heart.png";
    
        let numFullHearts = Math.floor(this.remainingLives / 2);
        let numEmptyHearts = 0;

        if (this.remainingLives % 2 === 0) { // No need for half heart if even number of lives reamining
            numEmptyHearts = (this.maxLives / 2) - numFullHearts;
        } else {
            numEmptyHearts = (this.maxLives / 2) - numFullHearts - 1; // 1 less empty heart to account for half heart
        }

        lives.innerHTML = "Lives:";

        for (let i = 0; i < numFullHearts; i++) {
            const fullHeart = document.createElement("li");
            fullHeart.innerHTML = `<img src="${fullHeartPath}" alt="full heart">`;
            livesList.appendChild(fullHeart);
        }

        if (this.remainingLives % 2 !== 0) {
            const halfHeart = document.createElement("li");
            halfHeart.innerHTML = `<img src="${halfHeartPath}" alt="full heart">`;
            livesList.appendChild(halfHeart);
        }

        for (let i = 0; i < numEmptyHearts; i++) {
            const emptyHeart = document.createElement("li");
            emptyHeart.innerHTML = `<img src="${emptyHeartPath}" alt="full heart">`;
            livesList.appendChild(emptyHeart);
        }

        lives.appendChild(livesList);
    }

    isVictory() {
        let victory = true;

        for (let i = 0; i < this.character.length; i++) {
            if (!this.guessedLetters.includes(this.character[i].toUpperCase())) {
                victory = false;
            }
        }

        return victory;
    }

    displayWordAndHint() {
        const wordAndHint = document.createElement("div");
        wordAndHint.innerHTML += `<h1>${this.getCurrentWordStatus()}</h1>`;
        wordAndHint.innerHTML += `<p>${this.hint}</p>`;
        display.replaceChildren(wordAndHint);
    }

    gameOver() {
        const gameOverMessage = document.createElement("div");
        gameOverMessage.innerHTML += `<h1>GAME OVER</h1>`;
        gameOverMessage.innerHTML += `<p>The character was: ${this.character}</p>`;
        display.replaceChildren(gameOverMessage);

        playerScore = 0; // Reset score on game over

        for (button of buttons) {
            button.setAttribute("disabled", true);
        }

        startButton.style.display = "block";
        startButton.innerHTML = "PLAY AGAIN";
    }

    victory() {
        const victoryMessage = document.createElement("div");
        victoryMessage.innerHTML += `<h2>YOU WIN!</h2>`;
        victoryMessage.innerHTML += `<p>Congratulations, you guessed the character: ${this.character}</p>`;
        display.replaceChildren(victoryMessage);

        for (button of buttons) {
            button.setAttribute("disabled", true);
        }

        startButton.style.display = "block";
        startButton.innerHTML = "PLAY AGAIN";
    }
}
