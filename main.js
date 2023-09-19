const { app, BrowserWindow, ipcMain, session } = require("electron");
const path = require("node:path");
const oauth = require("./oauth.js");
const secrets = require("./secrets.json");

let win;

function createWindow() {
  return new BrowserWindow({
    minWidth: 1000,
    minHeight: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // nodeIntegration: true,
      // Don't uncomment, will break linux. xoxo
    },
  });
}

function showDashboard() {
  win.loadFile("./views/dashboard.html").then(() => {
    win.show();
  });
}
function showGames() {
  win.loadFile("./views/games.html").then(() => {
    win.show();
  });
}

const redirectUri = "http://localhost:5000/callback";

const filter = {
  urls: [redirectUri + "*"],
};

app.whenReady().then(() => {
  setInterval(() => {
    console.log("Updating token!!");
    oauth.refreshTokens();
  }, 1000 * 150);
  ipcMain.on("redirect", (event, page) => {
    console.log(`Redirecting to ${page}`);
    console.log(page);
    switch (page) {
      case "home":
        showDashboard();
        return;
      case "games":
        showGames();
        return;
    }
  });
  win = createWindow();

  session.defaultSession.webRequest.onBeforeRequest(
    filter,
    async function (details, callback) {
      const url = details.url;

      await oauth.sufferWithTokens(url);
      showDashboard();
    }
  );

  var stateKey = Date.now(); //Change later

  var authLink = `https://sso.chaster.app/auth/realms/app/protocol/openid-connect/auth?client_id=${secrets.CLIENT_ID}&response_type=code&scope=profile locks&state=${stateKey}`;
  var logoutLink = `https://chaster.app/logout`;
  win.loadURL(authLink);

  // win.removeMenu();

  ipcMain.handle("getProfile", async () => {
    return await getProfile(oauth.getAccessToken());
  });

  ipcMain.handle("getLock", async () => {
    return await getLock(oauth.getAccessToken());
  });

  ipcMain.handle("getLockHistory", async (event, lockID) => {
    return await getLockHistory(oauth.getAccessToken(), lockID);
  });

  ipcMain.on("logout", () => {
    win.loadURL(logoutLink).then(() => {
      setTimeout(() => {
        win.loadURL(authLink);
        app.relaunch();
      }, 5000);
    });
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (app.platform !== "darwin") app.quit();
});

async function getProfile(token) {
  const response = await fetch("https://api.chaster.app/auth/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const myJson = await response.json();
  return myJson;
}

async function getLock(token) {
  const response = await fetch("https://api.chaster.app/locks", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const myJson = await response.json();
  return myJson;
}

async function getLockHistory(token, lockID) {
  const response = await fetch(
    `https://api.chaster.app/locks/${lockID}/history`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const myJson = await response.json();
  return myJson;
}


require('./updater.js');