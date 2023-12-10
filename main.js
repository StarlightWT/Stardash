const {
	app,
	BrowserWindow,
	ipcMain,
	session,
	Tray,
	Menu,
} = require("electron");
const path = require("node:path");
const oauth = require("./src/handlers/oauth.js");
const request = require("./src/handlers/api_handler.js");
const redirects = require("./src/handlers/redirects.js");
const updater = require("./src/handlers/updater.js");
const Store = require("electron-store");
let win, closing;

const temp = new Store();

app.setLoginItemSettings({
	openAtLogin: true,
	openAsHidden: true, // Optional: Hide the app window on startup
});

//Create window for everything to be inside of
function createWindow() {
	var height = 700;
	var width = 1000;
	return new BrowserWindow({
		width: width,
		height: height,
		x: temp.get("x") ?? 0,
		y: temp.get("y") ?? 0,
		resizable: false,
		center: false,
		fullscreenable: false,
		roundedCorners: true,
		icon: "./icon.ico",
		backgroundColor: "#000",
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
		oauth.refreshTokens();
	}, 1000 * 100);

	win = createWindow();

	//Authorize user
	session.defaultSession.webRequest.onBeforeRequest(
		filter,
		async function (details) {
			const url = details.url;

			await oauth.sufferWithTokens(url, startInfoUpdate);
			redirects.redirect(win, "loading");
		}
	);

	win.removeMenu();
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

	win.on("close", (e) => {
		if (!closing) e.preventDefault();
		win.hide();
	});

	tray = new Tray(path.join(__dirname, "icon.ico"));
	const contextMenu = Menu.buildFromTemplate([
		{
			label: "Show app",
			type: "normal",
			click: (e) => {
				win.show();
			},
		},
		{
			label: "Quit app",
			type: "normal",
			click: (e) => {
				closing = true;
				const pos = win.getPosition();
				temp.set("x", pos[0]);
				temp.set("y", pos[1]);

				app.quit();
			},
		},
	]);

	tray.on("click", (e) => {
		win.show();
	});
	tray.setContextMenu(contextMenu);
});

//Handle logging out
var logoutLink = `https://chaster.app/logout`;
ipcMain.on("logout", () => {
	request.updateInfo("clear", "clear", network);
	win.loadURL(logoutLink).then(() => {
		setTimeout(() => {
			app.relaunch();
			app.exit(0);
		}, 5000);
	});
});

var loadStatus = 0;
ipcMain.handle("loadStatus", () => {
	return loadStatus;
});

let network = true;
ipcMain.on("network", async (event, status) => {
	if (status == "online") {
		network = true;
		if (temp.get("activeLocation") == "loading")
			redirects.redirect(win, "home");
	}
	if (status == "offline") {
		network = false;
		if (temp.get("activeLocation") != "loading")
			redirects.redirect(win, "loading");
	}
});

ipcMain.on("redirect", (event, page, modal) => {
	redirects.redirect(win, page, modal);
});

async function startInfoUpdate(accessToken) {
	loadStatus = await request.updateInfo(accessToken, null, network);
	var sessionList = request.get("extension");
	sessionList.results.forEach((session) => {
		const profile = request.get("profile", null, network);
		if (session.lock.user._id == profile._id) {
			request.updateInfo(accessToken, session.sessionId, network);
		}
	});
	setInterval(async () => {
		loadStatus = await request.updateInfo(null, null, network);
	}, 5 * 1000); //5seconds
}

require("./src/handlers/ipc_handler.js")(ipcMain, temp);
