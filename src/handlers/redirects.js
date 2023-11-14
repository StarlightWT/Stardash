const fs = require("fs");
const path = require("path");
const request = require("./api_handler");
const { BrowserWindow } = require("electron");
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
	if (location == "slots") {
		const profile = await request.get("profile");
		const dbProfileObject = await request.get("dbprofile", profile._id);
		const dbProfile = await dbProfileObject[0]._id;
		if (dbProfile.role != "developer") return;
	}
	console.log(`[Redirects] Trying to redirect to ${location}...`);
	if (location.startsWith("http") || modal) {
		const child = new BrowserWindow({
			parent: win,
			modal: true,
			show: false,
			autoHideMenuBar: true,
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
