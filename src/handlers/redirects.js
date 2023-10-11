const fs = require("fs");
const path = require("path");

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

function redirect(win, location) {
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
