import { app, BrowserWindow, Menu } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createMainWindow() {
  const window = new BrowserWindow({
    width: 720,
    height: 820,
    minWidth: 420,
    minHeight: 560,
    title: `Snakegame ${app.getVersion()}`,
    backgroundColor: "#f4f4f1",
    autoHideMenuBar: true,
    icon: path.join(__dirname, "..", "assets", "app-icon.png"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  Menu.setApplicationMenu(null);
  window.loadFile(path.join(__dirname, "..", "index.html"));
}

app.whenReady().then(() => {
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
