const { app, BrowserWindow, ipcMain, session, clipboard } = require("electron");
const path = require("node:path");
const oauth = require("./src/handlers/oauth.js");
const secrets = require("./secrets.json");
const request = require("./src/handlers/api_handler.js");
const redirects = require("./src/handlers/redirects.js");
const database = require("./src/handlers/db_handler.js");
const updater = require("./src/handlers/updater.js");

let win;
var extension;
var stardashConnectID;
var loadStatus = 0;

//Run auto-updater

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

app.whenReady().then(async () => {
	await updater.check();
	//Refresh token every 1,5minutes
	setInterval(() => {
		console.log("Updating token!!");
		oauth.refreshTokens();
	}, 1000 * 60);

	win = createWindow();
	win.setIcon("./icon.ico");

	//Authorize user
	session.defaultSession.webRequest.onBeforeRequest(
		filter,
		async function (details) {
			const url = details.url;

			await oauth.sufferWithTokens(url, startInfoUpdate);
			redirects.redirect(win, "loading");
		}
	);

	// win.removeMenu();
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
			app.relaunch();
			app.exit(0);
		}, 5000);
	});
});

//Handle redirects
ipcMain.on("redirect", (event, page) => {
	redirects.redirect(win, page);
});

let activeLocation;

ipcMain.handle("active", (event, location) => {
	if (location == "get") return activeLocation;
	activeLocation = location;
});

//Handle requests from renderers

ipcMain.handle("get", async (event, what, option) => {
	return await request.get(what, option);
});

ipcMain.handle("action", async (event, what, option) => {
	console.log(what + "||" + option);
	return await request.action(what, option);
});

ipcMain.handle("setUserRole", async (e, id, role) => {
	database.setUserRole(id, role);
});

ipcMain.handle("loadStatus", (event, status) => {
	console.log(`[Main] Load status ${loadStatus}...`);
	return loadStatus;
});

ipcMain.handle("version", async () => {
	return await updater.version();
});

ipcMain.handle("getStatus", async () => {
	return await updater.getStatus();
});

ipcMain.on("log", async (event, title, description, role, colour, logIcon) => {
	// console.log(`Logging... ${logIcon}`);
	// await call.log(
	// 	secrets.DEV_TKN,
	// 	stardashConnectID,
	// 	title,
	// 	description,
	// 	role,
	// 	colour
	// );
});

ipcMain.on("clip", async (event, text) => {
	clipboard.writeText(text);
});

ipcMain.on("updateCheck", () => {
	updater.check();
});

//Load info and update it every 5 seconds
async function startInfoUpdate(accessToken) {
	loadStatus = await request.updateInfo(accessToken);
	await request.get("extension").then((sessionList) => {
		sessionList.results.forEach(async (session) => {
			const profile = await request.get("profile");
			if (session.lock.user._id == profile._id) {
				request.updateInfo(accessToken, session.sessionId);
			}
		});
	});
	setInterval(async () => {
		loadStatus = await request.updateInfo(accessToken);
	}, 5 * 1000); //5seconds
}
