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
const levelElement = document.querySelector("#level");
const targetElement = document.querySelector("#target");
const pauseButton = document.querySelector("#pause-button");
const restartButton = document.querySelector("#restart-button");

const statusLabels = {
  running: "Running",
  paused: "Paused",
  gameover: "Game Over",
  completed: "All Levels Cleared"
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
const rotationByDirection = {
  right: "0deg",
  down: "90deg",
  left: "180deg",
  up: "270deg"
};

function indexForCell(cell) {
  return cell.y * state.width + cell.x;
}

function directionBetween(from, to) {
  if (to.x === (from.x + 1) % state.width && to.y === from.y) {
    return "right";
  }

  if (to.x === (from.x - 1 + state.width) % state.width && to.y === from.y) {
    return "left";
  }

  if (to.y === (from.y + 1) % state.height && to.x === from.x) {
    return "down";
  }

  return "up";
}

function applySnakeSegmentSprite(cellElement, index) {
  if (index === 0) {
    cellElement.classList.add("cell--snake-head");
    cellElement.style.setProperty("--sprite-rotation", rotationByDirection[state.direction]);
    return;
  }

  if (index === state.snake.length - 1) {
    const tail = state.snake[index];
    const previous = state.snake[index - 1];
    const connectionDirection = directionBetween(tail, previous);
    cellElement.classList.add("cell--snake-tail");
    cellElement.style.setProperty("--sprite-rotation", rotationByDirection[connectionDirection]);
    return;
  }

  const segment = state.snake[index];
  const previous = state.snake[index - 1];
  const next = state.snake[index + 1];
  const directionToPrevious = directionBetween(segment, previous);
  const directionToNext = directionBetween(segment, next);
  const directions = [directionToPrevious, directionToNext];

  if (
    (directions.includes("left") && directions.includes("right")) ||
    (directions.includes("up") && directions.includes("down"))
  ) {
    cellElement.classList.add("cell--snake-body");
    cellElement.style.setProperty(
      "--sprite-rotation",
      directions.includes("left") ? "0deg" : "90deg"
    );
    return;
  }

  const turnKey = [directionToPrevious, directionToNext].sort().join("-");
  const turnRotations = {
    "right-up": "0deg",
    "down-right": "90deg",
    "down-left": "180deg",
    "left-up": "270deg"
  };

  cellElement.classList.add("cell--snake-turn");
  cellElement.style.setProperty("--sprite-rotation", turnRotations[turnKey]);
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
    cellElement.style.removeProperty("--sprite-rotation");
  }

  for (const obstacle of state.obstacles) {
    cells[indexForCell(obstacle)].classList.add("cell--obstacle");
  }

  for (let index = 0; index < state.snake.length; index += 1) {
    applySnakeSegmentSprite(cells[indexForCell(state.snake[index])], index);
  }

  if (state.food !== null) {
    cells[indexForCell(state.food)].classList.add("cell--food");
  }

  scoreElement.textContent = String(state.score);
  statusElement.textContent = statusLabels[state.status];
  levelElement.textContent = `${state.levelNumber}/${state.totalLevels}`;
  targetElement.textContent = String(state.foodsRemainingInLevel);
  pauseButton.textContent = state.status === "paused" ? "Resume" : "Pause";
  pauseButton.disabled = state.status === "gameover" || state.status === "completed";
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
