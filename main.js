const {
	app,
	BrowserWindow,
	ipcMain,
	session,
	Tray,
	Menu,
	screen,
} = require("electron");
const path = require("node:path");
const redirects = require("./src/handlers/redirects.js");
const updater = require("./src/handlers/updater.js");
const Store = require("electron-store");
const { checkToken } = require("./src/handlers/login/login_handler.js");
let win, closing;

const temp = new Store();

app.setLoginItemSettings({
	openAtLogin: temp.get("bootOnStart") ?? temp.set("bottOnStart", true),
	openAsHidden: true, // Optional: Hide the app window on startup
});

//Create window for everything to be inside of
function createWindow() {
	let { width, height } = screen.getPrimaryDisplay().workAreaSize;
	temp.get("size") ?? temp.set("size", [0, 0]);
	return new BrowserWindow({
		maxWidth: temp.get("size")[0] ?? Math.floor(width / 1.3),
		maxHeight: temp.get("size")[1] ?? Math.floor(height / 1.2),
		width: temp.get("size")[0] ?? Math.floor(width / 1.3),
		height: temp.get("size")[1] ?? Math.floor(height / 1.2),
		minHeight: Math.floor(height / 1.4),
		minWidth: Math.floor(width / 1.8),
		x: temp.get("x") ?? 0,
		y: temp.get("y") ?? 0,
		center: false,
		roundedCorners: true,
		icon: "./icon.ico",
		backgroundColor: "#000",
		webPreferences: {
			preload: path.join(__dirname, "/src/preload.js"),
			webgl: false, // adjust as needed
			offscreen: false, // adjust as needed
		},
	});
}
app.whenReady().then(async () => {
	await updater.check();
	win = createWindow();

	require("./src/handlers/ipc_handler.js")(ipcMain, temp, win);

	if ((await checkToken(temp)) == 0) redirects.redirect(win, "home");
	else redirects.redirect(win, "login");
	//Create initial window
	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});

	win.on("close", (e) => {
		if (!closing) e.preventDefault();
		const pos = win.getPosition();
		temp.set("x", pos[0]);
		temp.set("y", pos[1]);
		temp.set("size", win.getSize());
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
				temp.set("size", win.getSize());

				app.quit();
			},
		},
	]);

	tray.on("click", (e) => {
		win.show();
	});
	tray.setContextMenu(contextMenu);
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

function LimitedSlowingTimer(startingTime, increment, limit) {
	setTimeout(() => {
		console.log(`[Main] Updating window position...`);
		const pos = win.getPosition();
		temp.set("x", pos[0]);
		temp.set("y", pos[1]);
		temp.set("size", win.getSize());

		if (startingTime < limit) startingTime += increment;
		LimitedSlowingTimer(startingTime, increment, limit);
	}, startingTime);
}
const initialTime = 6 * 10 * 1000; //1 minute
const stepUp = 6 * 10 * 1000 * 10; //10 minutes
const limit = 6 * 10 * 1000 * 60; //1 hour

LimitedSlowingTimer(initialTime, stepUp, limit);
