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
const LEVEL_TEMPLATE_COUNT = 6;
const TOTAL_LEVELS = 30;
const FOODS_PER_LEVEL = 3;

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

function cellKey(cell) {
  return `${cell.x},${cell.y}`;
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

function addFilledBlock(cells, startX, startY, blockWidth, blockHeight) {
  for (let y = startY; y < startY + blockHeight; y += 1) {
    for (let x = startX; x < startX + blockWidth; x += 1) {
      cells.add(`${x},${y}`);
    }
  }
}

function addLine(cells, startX, startY, endX, endY) {
  if (startX === endX) {
    const [fromY, toY] = startY <= endY ? [startY, endY] : [endY, startY];

    for (let y = fromY; y <= toY; y += 1) {
      cells.add(`${startX},${y}`);
    }

    return;
  }

  const [fromX, toX] = startX <= endX ? [startX, endX] : [endX, startX];

  for (let x = fromX; x <= toX; x += 1) {
    cells.add(`${x},${startY}`);
  }
}

function parseCells(cellSet) {
  return [...cellSet].map((entry) => {
    const [x, y] = entry.split(",").map(Number);
    return { x, y };
  });
}

function buildObstacleLayout(templateId, width, height) {
  const cells = new Set();

  switch (templateId) {
    case 0:
      addLine(cells, 4, 4, 4, 7);
      addLine(cells, width - 5, 4, width - 5, 7);
      addLine(cells, 4, height - 8, 4, height - 5);
      addLine(cells, width - 5, height - 8, width - 5, height - 5);
      break;
    case 1:
      addLine(cells, 3, 5, 7, 5);
      addLine(cells, width - 8, 5, width - 4, 5);
      addLine(cells, 3, height - 6, 7, height - 6);
      addLine(cells, width - 8, height - 6, width - 4, height - 6);
      break;
    case 2:
      addLine(cells, 5, 3, 5, 7);
      addLine(cells, 5, height - 8, 5, height - 4);
      addLine(cells, width - 6, 3, width - 6, 7);
      addLine(cells, width - 6, height - 8, width - 6, height - 4);
      addLine(cells, 8, 4, 11, 4);
      addLine(cells, 8, height - 5, 11, height - 5);
      break;
    case 3:
      addFilledBlock(cells, 3, 3, 3, 3);
      addFilledBlock(cells, width - 6, 3, 3, 3);
      addFilledBlock(cells, 3, height - 6, 3, 3);
      addFilledBlock(cells, width - 6, height - 6, 3, 3);
      break;
    case 4:
      for (let x = 3; x <= width - 4; x += 2) {
        cells.add(`${x},4`);
        cells.add(`${x + 1},7`);
        cells.add(`${x},height - 8`);
        cells.add(`${x + 1},height - 5`);
      }
      break;
    case 5:
      for (let x = 2; x <= width - 3; x += 1) {
        if (x < 8 || x > 11) {
          cells.add(`${x},2`);
          cells.add(`${x},${height - 3}`);
        }
      }

      for (let y = 2; y <= height - 3; y += 1) {
        if (y < 8 || y > 11) {
          cells.add(`2,${y}`);
          cells.add(`${width - 3},${y}`);
        }
      }
      break;
    default:
      break;
  }

  return parseCells(cells);
}

export function createLevelSequence(
  totalLevels = TOTAL_LEVELS,
  templateCount = LEVEL_TEMPLATE_COUNT,
  selectIndex = defaultSelectIndex
) {
  const sequence = [];

  while (sequence.length < totalLevels) {
    const remainingTemplates = Array.from({ length: templateCount }, (_, index) => index);

    while (remainingTemplates.length > 0 && sequence.length < totalLevels) {
      const nextTemplateIndex = selectIndex(remainingTemplates.length);
      sequence.push(remainingTemplates.splice(nextTemplateIndex, 1)[0]);
    }
  }

  return sequence;
}

function isBlockedCell(cell, snake, obstacles = []) {
  return (
    snake.some((segment) => cellsEqual(segment, cell)) ||
    obstacles.some((obstacle) => cellsEqual(obstacle, cell))
  );
}

function createLevelState(
  {
    width,
    height,
    score = 0,
    direction = "right",
    levelIndex = 0,
    totalLevels = TOTAL_LEVELS,
    foodsPerLevel = FOODS_PER_LEVEL,
    levelSequence
  },
  selectIndex
) {
  const snake = createInitialSnake(width, height);
  const currentTemplate = levelSequence[levelIndex];
  const obstacles = buildObstacleLayout(currentTemplate, width, height).filter(
    (obstacle) => !snake.some((segment) => cellsEqual(segment, obstacle))
  );
  const baseState = {
    width,
    height,
    snake,
    direction,
    nextDirection: direction,
    food: null,
    score,
    status: "running",
    totalLevels,
    foodsPerLevel,
    foodsRemainingInLevel: foodsPerLevel,
    levelIndex,
    levelNumber: levelIndex + 1,
    levelTemplate: currentTemplate + 1,
    levelSequence,
    obstacles
  };

  return {
    ...baseState,
    food: spawnFood(baseState, selectIndex)
  };
}

export function spawnFood(state, selectIndex = defaultSelectIndex) {
  const availableCells = [];

  for (let y = 0; y < state.height; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      const occupied = isBlockedCell({ x, y }, state.snake, state.obstacles);

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
  const levelSequence = createLevelSequence(TOTAL_LEVELS, LEVEL_TEMPLATE_COUNT, selectIndex);

  return createLevelState(
    {
      width,
      height,
      direction,
      levelSequence
    },
    selectIndex
  );
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
  if (state.status === "gameover" || state.status === "completed") {
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

  const obstacles = state.obstacles ?? [];
  const foodsPerLevel = state.foodsPerLevel ?? FOODS_PER_LEVEL;
  const foodsRemainingBeforeEat = state.foodsRemainingInLevel ?? foodsPerLevel;
  const totalLevels = state.totalLevels ?? TOTAL_LEVELS;
  const levelSequence =
    state.levelSequence ?? createLevelSequence(totalLevels, LEVEL_TEMPLATE_COUNT, selectIndex);
  const levelIndex = state.levelIndex ?? 0;
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

  const hitObstacle = obstacles.some((obstacle) => cellsEqual(obstacle, nextHead));

  const hitSelf = movedSnake
    .slice(1)
    .some((segment) => cellsEqual(segment, nextHead));

  if (hitSelf || hitObstacle) {
    return {
      ...state,
      snake: movedSnake,
      direction,
      nextDirection: direction,
      status: "gameover"
    };
  }

  if (willEat) {
    const foodsRemainingInLevel = foodsRemainingBeforeEat - 1;
    const grownState = {
      ...state,
      snake: movedSnake,
      direction,
      nextDirection: direction,
      score: state.score + 1,
      foodsRemainingInLevel,
      foodsPerLevel,
      totalLevels,
      levelSequence,
      levelIndex
    };

    if (foodsRemainingInLevel === 0) {
      if (levelIndex + 1 >= totalLevels) {
        return {
          ...grownState,
          food: null,
          status: "completed"
        };
      }

      return createLevelState(
        {
          width: state.width,
          height: state.height,
          score: state.score + 1,
          levelIndex: levelIndex + 1,
          totalLevels,
          foodsPerLevel,
          levelSequence
        },
        selectIndex
      );
    }

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
