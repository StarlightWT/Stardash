const fs = require("fs");
const path = require("path");
// const request = require("./api_handler");
const { BrowserWindow, screen } = require("electron");

function getPaths(dirPath, arrayOfFiles) {
	files = fs.readdirSync(dirPath);
	arrayOfFiles = arrayOfFiles || [];
	files.forEach((file) => {
		if (fs.statSync(dirPath + "/" + file).isDirectory()) {
			arrayOfFiles = getPaths(dirPath + "/" + file, arrayOfFiles);
		} else if (file.endsWith(".html")) {
			arrayOfFiles.push(path.join(dirPath, "/", file));
		}
	});
	return arrayOfFiles;
}
const paths = getPaths(path.join(__dirname + "../../../views"));

async function redirect(win, location, modal) {
	var modalHeight, modalWidth, frame;
	frame = true;

	let size = win.getSize();
	if (win.isMaximized()) {
		const currentScreen = screen.getDisplayNearestPoint(
			screen.getCursorScreenPoint()
		);
		size[0] = currentScreen.workAreaSize.width;
		size[1] = currentScreen.workAreaSize.height;
	}
	modalHeight = Math.floor(size[1] / 1.1);
	modalWidth = Math.floor(size[0] / 1.1);

	console.log(`[Redirects] Trying to redirect to ${location}...`);
	switch (location) {
		case "combo":
			modal = true;
			frame = false;
			modalHeight = 200;
			modalWidth = 500;
			break;
	}

	if (location.startsWith("http") || modal) {
		let pos = win.getPosition(); //Get left top corner of main window
		let size = win.getSize(); //Get window size
		let x = pos[0] + size[0] / 2; //Center of window
		let y = pos[1] + size[1] / 2;

		x = Math.floor(x - modalWidth / 2); //Center the modal around the center of the window
		y = Math.floor(y - modalHeight / 2);

		const child = new BrowserWindow({
			transparent: true,
			frame: frame,
			// autoHideMenuBar: true,
			x: x,
			y: y,
			hasShadow: true,
			height: modalHeight,
			width: modalWidth,
			icon: "../../icon.ico",
			parent: win,
			modal: true,
			show: false,
			minimizable: false,
			fullscreenable: false,
			resizable: false,
			roundedCorners: true,
			webPreferences: {
				preload: path.join(__dirname, "../preload.js"),
			},
		});
		if (modal)
			paths.forEach((path) => {
				if (path.endsWith(location) || path.endsWith(location + ".html"))
					child.loadFile(path);
			});
		else child.loadURL(location);
		child.once("ready-to-show", () => {
			child.show();
		});
	} else
		paths.forEach((path) => {
			if (path.endsWith(location) || path.endsWith(location + ".html"))
				win.loadFile(path).then(() => {
					win.show();
				});
		});

	return console.log(`[Redirects] Redirected!`);
}

module.exports = {
	redirect,
};
