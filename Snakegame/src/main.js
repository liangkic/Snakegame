import {
  createGameState,
  queueDirection,
  restartGame,
  stepGame,
  togglePause
} from "./gameLogic.js";

const BOARD_SIZE = 20;
const TICK_MS = 150;

const boardElement = document.querySelector("#board");
const scoreElement = document.querySelector("#score");
const statusElement = document.querySelector("#status");
const pauseButton = document.querySelector("#pause-button");
const restartButton = document.querySelector("#restart-button");

const statusLabels = {
  running: "Running",
  paused: "Paused",
  gameover: "Game Over"
};

const keyToDirection = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  W: "up",
  a: "left",
  A: "left",
  s: "down",
  S: "down",
  d: "right",
  D: "right"
};

let state = createGameState({ width: BOARD_SIZE, height: BOARD_SIZE });
const cells = [];

function indexForCell(cell) {
  return cell.y * state.width + cell.x;
}

function createBoard() {
  boardElement.style.setProperty("--grid-width", state.width);
  boardElement.style.setProperty("--grid-height", state.height);

  const fragment = document.createDocumentFragment();

  for (let index = 0; index < state.width * state.height; index += 1) {
    const cellElement = document.createElement("div");
    cellElement.className = "cell";
    cellElement.setAttribute("role", "gridcell");
    fragment.appendChild(cellElement);
    cells.push(cellElement);
  }

  boardElement.replaceChildren(fragment);
}

function render() {
  for (const cellElement of cells) {
    cellElement.className = "cell";
  }

  for (const segment of state.snake) {
    cells[indexForCell(segment)].classList.add("cell--snake");
  }

  if (state.food !== null) {
    cells[indexForCell(state.food)].classList.add("cell--food");
  }

  scoreElement.textContent = String(state.score);
  statusElement.textContent = statusLabels[state.status];
  pauseButton.textContent = state.status === "paused" ? "Resume" : "Pause";
  pauseButton.disabled = state.status === "gameover";
}

function restart() {
  state = restartGame(state);
  render();
}

function togglePauseState() {
  state = togglePause(state);
  render();
}

document.addEventListener("keydown", (event) => {
  const nextDirection = keyToDirection[event.key];

  if (nextDirection) {
    event.preventDefault();
    state = queueDirection(state, nextDirection);
    return;
  }

  if (event.key === " " || event.code === "Space") {
    event.preventDefault();
    togglePauseState();
    return;
  }

  if (event.key === "r" || event.key === "R") {
    restart();
  }
});

pauseButton.addEventListener("click", togglePauseState);
restartButton.addEventListener("click", restart);

createBoard();
render();

window.setInterval(() => {
  state = stepGame(state);
  render();
}, TICK_MS);
