const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("node:path");

let win;

function createWindow() {
  return new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
}

function showMainWindow() {
  win.loadFile("index.html").then(() => {
    win.show();
  });
}

function showDashboard() {
  win.loadFile("dashboard.html").then(() => {
    win.show();
  });
}

app.whenReady().then(() => {
  ipcMain.on("redirect", () => {
    console.log("Redirecting to dashboard...");
    showDashboard();
  });
  win = createWindow();
  showMainWindow();

  // win.removeMenu();

  //Define shortucts
  globalShortcut.register("CommandOrControl+W", () => {
    app.quit();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
