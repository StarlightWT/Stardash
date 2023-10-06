const { autoUpdater, AppUpdater } = require("electron-updater");
const config = require("../../secrets.json");

console.log("Running update check!");
var status = "Not updating...";

autoUpdater.setFeedURL({
	provider: "github",
	owner: "StarlightWT",
	protocol: "https",
	repo: "StarDash",
	token: config.GH_TKN,
	channel: "latest",
});

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.allowPrerelease = true;
autoUpdater.disableWebInstaller = true;

async function check() {
	console.log("[Updater] Checking for update!");
	return await autoUpdater.checkForUpdatesAndNotify();
}

async function version() {
	return await autoUpdater.currentVersion.version;
}

async function active() {
	return await autoUpdater.isUpdaterActive();
}

autoUpdater.on("download-progress", (progress) => {
	status = progress.percent;
});

async function getStatus() {
	return status;
}

autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
	console.log(`[Updater] Update downloaded!!!`);
	status = "Downloaded!";
});

module.exports = {
	version,
	check,
	active,
	getStatus,
};
