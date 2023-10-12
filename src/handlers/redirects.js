const fs = require("fs");
const path = require("path");
const request = require("./api_handler");
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
const paths = getPaths("./views");

async function redirect(win, location) {
	if (location == "slots") {
		const profile = await request.get("profile");
		const dbProfileObject = await request.get("dbprofile", profile._id);
		const dbProfile = await dbProfileObject[0]._id;
		if (dbProfile.role != "developer") return;
	}
	console.log(`[Redirects] Trying to redirect to ${location}...`);
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
