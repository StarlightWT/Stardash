const { app, BrowserWindow, ipcMain, session } = require("electron");
const path = require("node:path");
const oauth = require("./src/handlers/oauth.js");
const secrets = require("./secrets.json");
const api = require("./src/handlers/api_calls.js");
const redirects = require("./src/handlers/redirects.js");

let win;

//Run auto-updater
require('./src/handlers/updater.js');

//Create window for everything to be inside of
function createWindow() {
  return new BrowserWindow({
    minWidth: 1000,
    minHeight: 800,
    webPreferences: {
      preload: path.join(__dirname, "/src/preload.js"),
    },
  });
}

const redirectUri = "http://localhost:5000/callback";

const filter = {
  urls: [redirectUri + "*"],
};

app.whenReady().then(() => {
  //Refresh token every 1,5minutes
  setInterval(() => {
    console.log("Updating token!!");
    oauth.refreshTokens();
  }, 1000 * 150);

  win = createWindow();

  //Authorize user
  session.defaultSession.webRequest.onBeforeRequest(
    filter,
    async function (details, callback) {
      const url = details.url;

      await oauth.sufferWithTokens(url);
      redirects.showDashboard(win);
    }
  );
  //send user to oauth page
  win.loadURL(oauth.authLink);
  
  //Create initial window(?)
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  //Close app if not on MacOS and all windows are closed
  app.on("window-all-closed", () => {
    if (app.platform !== "darwin") app.quit();
  });
});

//Handle logging out
var logoutLink = `https://chaster.app/logout`;
ipcMain.on("logout", () => {
  win.loadURL(logoutLink).then(() => {
    setTimeout(() => {
      win.loadURL(oauth.authLink);
      app.relaunch();
    }, 5000);
  });
});

//Handle redirects
ipcMain.on("redirect", (event, page) => {
  console.log(`Redirecting to ${page}`);
  switch (page) {
    case "home":
      redirects.showDashboard(win);
      return;
    case "games":
      redirects.showGames(win);
      return;
    case "casino":
      redirects.showCasino(win);
      return;
  }
});

ipcMain.on("casino", (e, id) => {
  console.log(`Casino game selected: ${id}`);
  switch(id) {
    case 0:
      //BlackJack
      redirects.blackJack(win);
      break;
  }
})

//Handle requests from renderers
ipcMain.handle("getProfile", async () => {
  await console.log(
    await api.getExtension(secrets.DEV_TKN)
  );
  return await api.getProfile(oauth.getAccessToken());
});

ipcMain.handle("getLock", async () => {
  return await api.getLock(oauth.getAccessToken());
});

ipcMain.handle("getLockHistory", async (event, lockID) => {
  return await api.getLockHistory(oauth.getAccessToken(), lockID);
});