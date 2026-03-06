import test from "node:test";
import assert from "node:assert/strict";

import {
  createLevelSequence,
  createGameState,
  queueDirection,
  restartGame,
  spawnFood,
  stepGame,
  togglePause
} from "../src/gameLogic.js";

function selectFirstIndex() {
  return 0;
}

test("createGameState builds a running game with valid food placement", () => {
  const state = createGameState({ width: 20, height: 20 }, selectFirstIndex);

  assert.equal(state.status, "running");
  assert.equal(state.score, 0);
  assert.equal(state.snake.length, 3);
  assert.notEqual(state.food, null);
  assert.equal(
    state.snake.some((segment) => segment.x === state.food.x && segment.y === state.food.y),
    false
  );
  assert.equal(state.levelSequence.length, 30);
  assert.deepEqual(state.levelSequence.slice(0, 6), [0, 1, 2, 3, 4, 5]);
  assert.equal(
    state.obstacles.some((obstacle) => obstacle.x === state.food.x && obstacle.y === state.food.y),
    false
  );
});

test("stepGame moves the snake one cell in its current direction", () => {
  const initialState = createGameState({ width: 20, height: 20 }, selectFirstIndex);
  const nextState = stepGame(initialState, selectFirstIndex);

  assert.deepEqual(nextState.snake[0], { x: initialState.snake[0].x + 1, y: initialState.snake[0].y });
  assert.equal(nextState.snake.length, initialState.snake.length);
});

test("queueDirection rejects immediate reverse turns", () => {
  const state = createGameState({ width: 20, height: 20 }, selectFirstIndex);
  const nextState = queueDirection(state, "left");

  assert.equal(nextState.nextDirection, "right");
});

test("stepGame grows the snake and increments score when food is eaten", () => {
  const state = {
    width: 6,
    height: 6,
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 }
    ],
    direction: "right",
    nextDirection: "right",
    food: { x: 3, y: 2 },
    score: 0,
    status: "running"
  };

  const nextState = stepGame(state, selectFirstIndex);

  assert.equal(nextState.score, 1);
  assert.equal(nextState.snake.length, 4);
  assert.deepEqual(nextState.snake[0], { x: 3, y: 2 });
});

test("stepGame wraps across the board edge instead of ending the game", () => {
  const state = {
    width: 4,
    height: 4,
    snake: [
      { x: 3, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 1 }
    ],
    direction: "right",
    nextDirection: "right",
    food: { x: 0, y: 0 },
    score: 0,
    status: "running"
  };

  const nextState = stepGame(state, selectFirstIndex);

  assert.equal(nextState.status, "running");
  assert.deepEqual(nextState.snake[0], { x: 0, y: 1 });
});

test("stepGame ends the game on self collision", () => {
  const state = {
    width: 5,
    height: 5,
    snake: [
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 1, y: 0 },
      { x: 2, y: 0 }
    ],
    direction: "left",
    nextDirection: "down",
    food: { x: 4, y: 4 },
    score: 0,
    status: "running"
  };

  const nextState = stepGame(state, selectFirstIndex);

  assert.equal(nextState.status, "gameover");
});

test("stepGame ends the game when the snake hits an obstacle", () => {
  const state = {
    width: 6,
    height: 6,
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 }
    ],
    direction: "right",
    nextDirection: "right",
    food: { x: 5, y: 5 },
    score: 0,
    status: "running",
    obstacles: [{ x: 3, y: 2 }]
  };

  const nextState = stepGame(state, selectFirstIndex);

  assert.equal(nextState.status, "gameover");
});

test("stepGame advances to the next level after enough food is collected", () => {
  const state = {
    ...createGameState({ width: 20, height: 20 }, selectFirstIndex),
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 }
    ],
    direction: "right",
    nextDirection: "right",
    food: { x: 3, y: 2 },
    foodsRemainingInLevel: 1,
    levelIndex: 0,
    levelNumber: 1,
    levelTemplate: 1,
    levelSequence: [0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5],
    obstacles: []
  };

  const nextState = stepGame(state, selectFirstIndex);

  assert.equal(nextState.levelIndex, 1);
  assert.equal(nextState.levelNumber, 2);
  assert.equal(nextState.levelTemplate, 2);
  assert.equal(nextState.foodsRemainingInLevel, 3);
  assert.equal(nextState.score, 1);
  assert.equal(nextState.snake.length, 3);
});

test("spawnFood never picks a snake occupied cell", () => {
  const food = spawnFood(
    {
      width: 3,
      height: 3,
      snake: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 0, y: 2 },
        { x: 1, y: 2 }
      ]
    },
    selectFirstIndex
  );

  assert.deepEqual(food, { x: 2, y: 2 });
});

test("restartGame resets the game state", () => {
  const runningState = {
    width: 8,
    height: 8,
    snake: [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 }
    ],
    direction: "down",
    nextDirection: "down",
    food: { x: 7, y: 7 },
    score: 4,
    status: "paused",
    totalLevels: 30,
    foodsPerLevel: 3,
    foodsRemainingInLevel: 1,
    levelIndex: 7,
    levelNumber: 8,
    levelTemplate: 4,
    levelSequence: createLevelSequence(30, 6, selectFirstIndex),
    obstacles: [{ x: 2, y: 2 }]
  };

  const restarted = restartGame(runningState, selectFirstIndex);

  assert.equal(restarted.status, "running");
  assert.equal(restarted.score, 0);
  assert.equal(restarted.direction, "right");
  assert.equal(restarted.snake.length, 3);
  assert.equal(restarted.levelNumber, 1);
  assert.equal(restarted.foodsRemainingInLevel, 3);
});

test("togglePause freezes game advancement until resumed", () => {
  const initialState = createGameState({ width: 20, height: 20 }, selectFirstIndex);
  const pausedState = togglePause(initialState);
  const afterTick = stepGame(pausedState, selectFirstIndex);
  const resumedState = togglePause(pausedState);

  assert.equal(pausedState.status, "paused");
  assert.deepEqual(afterTick, pausedState);
  assert.equal(resumedState.status, "running");
});
