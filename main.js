const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  session,
} = require("electron");
const path = require("node:path");
const oauth = require("./oauth.js");
const secrets = require("./secrets.json");


let win;

function createWindow() {
  return new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });
}

function showDashboard() {
  win.loadFile("dashboard.html").then(() => {
    win.show();
  });
}

const redirectUri = "http://localhost:5000/callback";

const filter = {
  urls: [redirectUri + "*"],
};

app.whenReady().then(() => {
  ipcMain.on("redirect", () => {
    console.log("Redirecting to dashboard...");
    showDashboard();
  });
  win = createWindow();

  session.defaultSession.webRequest.onBeforeRequest(
    filter,
    async function (details, callback) {
      const url = details.url;

      await oauth.sufferWithTokens(url);
      showDashboard();
    });
    
  var stateKey = Date.now(); //Change later

  var authLink = `https://sso.chaster.app/auth/realms/app/protocol/openid-connect/auth?client_id=${secrets.CLIENT_ID}&response_type=code&scope=profile&state=${stateKey}`;
  win.loadURL(authLink);

  win.removeMenu();

  ipcMain.handle("getProfile", async () => {
    return await getProfile(oauth.getAccessToken());
  })

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


async function getProfile(token){
  const response = await fetch('https://api.chaster.app/auth/profile', {
    method: "GET",
    headers: {
      'Authorization' : `Bearer ${token}`
    }
  });
  const myJson = await response.json();
  return myJson;
}