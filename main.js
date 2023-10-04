const { app, BrowserWindow, ipcMain, session, clipboard } = require("electron");
const path = require("node:path");
const oauth = require("./src/handlers/oauth.js");
const secrets = require("./secrets.json");
const request = require("./src/handlers/api_handler.js");
const call = require("./src/handlers/api_calls.js");
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

app.whenReady().then(() => {
	updater.check();
	//Refresh token every 1,5minutes
	setInterval(() => {
		console.log("Updating token!!");
		oauth.refreshTokens();
	}, 1000 * 150);

	win = createWindow();

	//Authorize user
	session.defaultSession.webRequest.onBeforeRequest(
		filter,
		async function (details) {
			const url = details.url;

			await oauth.sufferWithTokens(url, startInfoUpdate);
			redirects.showLoading(win);
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
	console.log(`Redirecting to ${page}`);
	switch (page) {
		case "home":
			redirects.showDashboard(win);
			return;
		case "games":
			redirects.showGames(win);
			return;
		case "loading":
			redirects.showLoading(win);
			return;
		case "settings":
			redirects.showSettings(win);
			return;
	}
});

ipcMain.on("game", (e, id) => {
	console.log(`Game selected: ${id}`);
	switch (id) {
		case 0:
			//BlackJack
			redirects.blackJack(win);
			break;
	}
});

//Handle requests from renderers
ipcMain.handle("getProfile", async () => {
	const profile = request.getProfile();
	database.createNewUser(profile.username, profile._id, "developer");
	return await request.getProfile();
});

ipcMain.handle("getDBProfile", async (event, id) => {
	return await database.findUser(id);
});

ipcMain.handle("getLock", async () => {
	return await request.getLock();
});

ipcMain.handle("getLockHistory", async () => {
	return await request.getLockHistory();
});

ipcMain.handle("connectStardash", async (event, userID) => {
	await request.getStarConnect().then((extensionList) => {
		extensionList.results.forEach((session) => {
			if (session.lock.user._id == userID) {
				extension = session;
				stardashConnectID = session.sessionId;
			}
		});
	});
	return extension;
});

ipcMain.handle("loadStatus", (event, status) => {
	console.log(`Responding... ${loadStatus}`);
	return loadStatus;
});

ipcMain.handle("version", async () => {
	return await updater.version;
});

ipcMain.on("addTime", async (event, time) => {
	console.log(`Adding time... (${time})`);
	await call.addTime(secrets.DEV_TKN, stardashConnectID, time);
});
ipcMain.on("remTime", async (event, time) => {
	console.log(`Removing time...(${time})`);
	await call.remTime(secrets.DEV_TKN, stardashConnectID, time);
});
ipcMain.on("log", async (event, title, description, role, colour, logIcon) => {
	console.log(`Logging... ${logIcon}`);
	await call.log(
		secrets.DEV_TKN,
		stardashConnectID,
		title,
		description,
		role,
		colour
	);
});

ipcMain.on("clip", async (event, text) => {
	clipboard.writeText(text);
});

//Load info and update it every 5 seconds
async function startInfoUpdate(accessToken) {
	loadStatus = await request.updateInfo(accessToken);

	setInterval(async () => {
		loadStatus = await request.updateInfo(accessToken);
	}, 5 * 1000); //5seconds
}
