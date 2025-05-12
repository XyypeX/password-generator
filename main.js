const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Database = require("./database/db");

let mainWindow;
const db = new Database();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    autoHideMenuBar: true,
    title: "Генератор паролей"
  });

  mainWindow.loadFile(path.join(__dirname, "frontend/index.html"));
}

app.whenReady().then(createWindow);

ipcMain.handle("save-password", async (event, password) => {
  try {
    const id = await db.savePassword(password);
    return { success: true, id };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("get-history", async () => {
  try {
    const rows = await db.getHistory(10);
    return { success: true, data: rows };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
