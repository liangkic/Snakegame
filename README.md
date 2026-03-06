# Snakegame

A minimal classic Snake game packaged for the browser and Windows desktop.

## Project Layout

- `Snakegame/`: source code, tests, Electron shell, and build scripts
- `Snakegame/dist/Snakegame-1.0.0.exe`: packaged Windows executable generated locally

## Run Locally

### Web version

```powershell
cd C:\AI\Codex\Snakegame
node server.js
```

Open `http://localhost:3000`.

### Desktop version

```powershell
cd C:\AI\Codex\Snakegame
npm.cmd install
npm.cmd run start
```

## Test

```powershell
cd C:\AI\Codex\Snakegame
node --test
```

## Build Windows EXE

```powershell
cd C:\AI\Codex\Snakegame
npm.cmd install
npm.cmd run build
```

The packaged executable is written to `Snakegame/dist/`.

## Controls

- Arrow keys or `WASD`: move
- `Space`: pause or resume
- `R`: restart

## Manual Verification

- Movement works with arrow keys and `WASD`
- The snake cannot reverse into itself immediately
- Eating food increases score and snake length
- Wall collision and self collision end the game
- Pause and resume preserve state
- Restart resets the board after pause or game over
