const { autoUpdater, AppUpdater } = require("electron-updater");

console.log("Running update check!");

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.forceDevUpdateConfig = true;

function check() {
	autoUpdater.checkForUpdates();
}

const version = "1.0.3";

module.exports = {
	version,
	check,
};
