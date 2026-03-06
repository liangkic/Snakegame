const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const OPPOSITE_DIRECTIONS = {
  up: "down",
  down: "up",
  left: "right",
  right: "left"
};

function defaultSelectIndex(length, randomFn = Math.random) {
  return Math.floor(randomFn() * length);
}

function cloneCell(cell) {
  return { x: cell.x, y: cell.y };
}

export function cellsEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}

function wrapCoordinate(value, limit) {
  return (value + limit) % limit;
}

function createInitialSnake(width, height) {
  const headX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);

  return [
    { x: headX, y: centerY },
    { x: headX - 1, y: centerY },
    { x: headX - 2, y: centerY }
  ];
}

export function spawnFood(state, selectIndex = defaultSelectIndex) {
  const availableCells = [];

  for (let y = 0; y < state.height; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      const occupied = state.snake.some((segment) => segment.x === x && segment.y === y);

      if (!occupied) {
        availableCells.push({ x, y });
      }
    }
  }

  if (availableCells.length === 0) {
    return null;
  }

  return cloneCell(availableCells[selectIndex(availableCells.length)]);
}

export function createGameState(
  { width = 20, height = 20, direction = "right" } = {},
  selectIndex = defaultSelectIndex
) {
  const snake = createInitialSnake(width, height);
  const baseState = {
    width,
    height,
    snake,
    direction,
    nextDirection: direction,
    food: null,
    score: 0,
    status: "running"
  };

  return {
    ...baseState,
    food: spawnFood(baseState, selectIndex)
  };
}

export function queueDirection(state, direction) {
  if (!DIRECTION_VECTORS[direction]) {
    return state;
  }

  const effectiveDirection = state.nextDirection ?? state.direction;

  if (OPPOSITE_DIRECTIONS[effectiveDirection] === direction) {
    return state;
  }

  return {
    ...state,
    nextDirection: direction
  };
}

export function togglePause(state) {
  if (state.status === "gameover") {
    return state;
  }

  return {
    ...state,
    status: state.status === "paused" ? "running" : "paused"
  };
}

export function restartGame(state, selectIndex = defaultSelectIndex) {
  return createGameState(
    {
      width: state.width,
      height: state.height,
      direction: "right"
    },
    selectIndex
  );
}

export function stepGame(state, selectIndex = defaultSelectIndex) {
  if (state.status !== "running") {
    return state;
  }

  const direction = state.nextDirection ?? state.direction;
  const vector = DIRECTION_VECTORS[direction];
  const nextHead = {
    x: wrapCoordinate(state.snake[0].x + vector.x, state.width),
    y: wrapCoordinate(state.snake[0].y + vector.y, state.height)
  };

  const willEat = state.food !== null && cellsEqual(nextHead, state.food);
  const movedSnake = [nextHead, ...state.snake.map(cloneCell)];

  if (!willEat) {
    movedSnake.pop();
  }

  const hitSelf = movedSnake
    .slice(1)
    .some((segment) => cellsEqual(segment, nextHead));

  if (hitSelf) {
    return {
      ...state,
      snake: movedSnake,
      direction,
      nextDirection: direction,
      status: "gameover"
    };
  }

  if (willEat) {
    const grownState = {
      ...state,
      snake: movedSnake,
      direction,
      nextDirection: direction,
      score: state.score + 1
    };
    const food = spawnFood(grownState, selectIndex);

    return {
      ...grownState,
      food,
      status: food === null ? "gameover" : "running"
    };
  }

  return {
    ...state,
    snake: movedSnake,
    direction,
    nextDirection: direction
  };
}
