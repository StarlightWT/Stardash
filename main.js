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
  var stateKey = Math.floor(Math.random()*100000000);
  var authLink = `https://sso.chaster.app/auth/realms/app/protocol/openid-connect/auth?client_id=${secrets.CLIENT_ID}&response_type=code&scope=profile locks&state=${stateKey}`;
  win.loadURL(authLink);
  
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
      win.loadURL(authLink);
      app.relaunch();
    }, 5000);
  });
});

//Handle redirects
ipcMain.on("redirect", (event, page) => {
  console.log(`Redirecting to ${page}`);
  console.log(page);
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

//Handle requests from renderers
ipcMain.handle("getProfile", async () => {
  return await api.getProfile(oauth.getAccessToken());
});

ipcMain.handle("getLock", async () => {
  return await api.getLock(oauth.getAccessToken());
});

ipcMain.handle("getLockHistory", async (event, lockID) => {
  return await api.getLockHistory(oauth.getAccessToken(), lockID);
});