// Get all the elements from the HTML that I need
const gameBoard = document.getElementById("gameBoard");
const startButton = document.getElementById("startButton");
const safeCountDisplay = document.getElementById("safeCount");
const livesCountDisplay = document.getElementById("livesCount");
const timerDisplay = document.getElementById("timer");
const message = document.getElementById("message");
const factBox = document.getElementById("factBox");

// Game settings that will be important
const rows = 6;
const cols = 6;
const pollutedCount = 6;
const totalTiles = rows * cols;
const totalSafeTiles = totalTiles - pollutedCount;
const startingLives = 3;
const startingTime = 50;

// Game state
let board = [];
let lives = startingLives;
let safeFound = 0;
let timeLeft = startingTime;
let gameOver = true;
let timerInterval = null;

// Clean water facts to stimulate better UX
const facts = [
  "Clean water helps kids stay healthy and stay in school.",
  "Many communities around the world still do not have reliable access to clean water.",
  "Clean water can help families spend less time collecting water and more time building their future."
];

// Start or restart the game
function startGame() {
  board = [];
  lives = startingLives;
  safeFound = 0;
  timeLeft = startingTime;
  gameOver = false;

  startButton.textContent = "Restart Game";
  message.textContent = "Game started! Tap a tile to search for clean water.";
  factBox.textContent = "Clean water changes everything.";

  createBoard();
  placePollutedTiles();
  calculateNearbyPollution();
  renderBoard();
  updateStats();
  startTimer();
}

// Function for create an empty board
function createBoard() {
  for (let i = 0; i < totalTiles; i++) {
    board.push({
      polluted: false,
      revealed: false,
      nearby: 0
    });
  }
}

// Randomly place polluted tiles
function placePollutedTiles() {
  let placedPollutedTiles = 0;

  // while loop condition fits better
  while (placedPollutedTiles < pollutedCount) {
    const randomIndex = Math.floor(Math.random() * totalTiles);

    if (board[randomIndex].polluted === false) {
      board[randomIndex].polluted = true;
      placedPollutedTiles++;
    }
  }
}

// Count how many polluted tiles are around each safe tile
function calculateNearbyPollution() {
  for (let i = 0; i < board.length; i++) {
    if (board[i].polluted) {
      continue;
    }

    const neighbors = getNeighborIndexes(i);
    let count = 0;

    for (let neighborIndex of neighbors) {
      if (board[neighborIndex].polluted) {
        count++;
      }
    }

    board[i].nearby = count;
  }
}

// Get the indexes around one tile
function getNeighborIndexes(index) {
  const neighbors = [];

  const row = Math.floor(index / cols);
  const col = index % cols;

  for (let rowChange = -1; rowChange <= 1; rowChange++) {
    for (let colChange = -1; colChange <= 1; colChange++) {
      const newRow = row + rowChange;
      const newCol = col + colChange;

      const isSameTile = rowChange === 0 && colChange === 0;
      const isInsideBoard =
        newRow >= 0 &&
        newRow < rows &&
        newCol >= 0 &&
        newCol < cols;

      if (!isSameTile && isInsideBoard) {
        const neighborIndex = newRow * cols + newCol;
        neighbors.push(neighborIndex);
      }
    }
  }

  return neighbors;
}

// Show the board on the page
function renderBoard() {
  gameBoard.innerHTML = "";

  for (let i = 0; i < board.length; i++) {
    const tile = document.createElement("button");
    tile.classList.add("tile");

    if (board[i].revealed) {
      tile.classList.add("revealed");

      if (board[i].polluted) {
        tile.classList.add("polluted");
        tile.textContent = "🚫";
      } else {
        tile.classList.add("safe");

        if (board[i].nearby > 0) {
          tile.textContent = board[i].nearby;
        } else {
          tile.textContent = "💧";
        }
      }
    }

    tile.addEventListener("click", function () {
      handleTileClick(i);
    });

    gameBoard.appendChild(tile);
  }
}

// Handle what happens when a player clicks a tile
function handleTileClick(index) {
  if (gameOver || board[index].revealed) {
    return;
  }

  board[index].revealed = true;

  if (board[index].polluted) {
    lives--;
    message.textContent = "Polluted water hit. You lost 1 life.";

    if (lives === 0) {
      endGame(false, "You ran out of lives. The water source was polluted.");
    }
  } else {
    safeFound++;

    if (board[index].nearby > 0) {
      message.textContent = `${board[index].nearby} polluted drop(s) nearby. Be careful.`;
    } else {
      message.textContent = "Safe water found!";
    }

    showFactAtMilestone();
    checkWin();
  }

  renderBoard();
  updateStats();
}

// Update lives, safe tiles, and timer
function updateStats() {
  safeCountDisplay.textContent = safeFound;
  livesCountDisplay.textContent = lives;
  timerDisplay.textContent = timeLeft;
}

// Start the countdown timer
function startTimer() {
  clearInterval(timerInterval);

  timerInterval = setInterval(function () {
    timeLeft--;
    updateStats();

    if (timeLeft <= 0) {
      endGame(false, "Time is up. Try again to protect the water source.");
    }
  }, 1000);
}

// Show facts after certain safe tile milestones
function showFactAtMilestone() {
  if (safeFound === 5) {
    factBox.textContent = facts[0];
  } else if (safeFound === 10) {
    factBox.textContent = facts[1];
  } else if (safeFound === 15) {
    factBox.textContent = facts[2];
  }
}

// Check if the player won
function checkWin() {
  if (safeFound === totalSafeTiles) {
    endGame(true, "You protected the community water source!");
  }
}

// End the game
function endGame(playerWon, finalMessage) {
  gameOver = true;
  clearInterval(timerInterval);
  message.textContent = finalMessage;

  if (playerWon) {
    factBox.textContent = "You won! Clean water can change a whole community.";
    celebrateWin();
  } else {
    revealPollutedTiles();
  }

  renderBoard();
}

// Reveal polluted tiles when the player loses
function revealPollutedTiles() {
  for (let i = 0; i < board.length; i++) {
    if (board[i].polluted) {
      board[i].revealed = true;
    }
  }
}

// Simple celebration effect
function celebrateWin() {
  document.body.classList.add("win-effect");

  setTimeout(function () {
    document.body.classList.remove("win-effect");
  }, 1000);
}

// Start button event
startButton.addEventListener("click", startGame);