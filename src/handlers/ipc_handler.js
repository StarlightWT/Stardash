console.log(`[IPC Handler] Loaded!`);
const request = require("./api_handler.js");
const temp = require("../temp.json");
const { clipboard } = require("electron");
module.exports = (ipcMain) => {
	ipcMain.handle("updateSettings", async () => {
		return await request.updateInfo(null, null, temp.network);
	});

	ipcMain.handle("version", async () => {
		return await updater.version();
	});

	ipcMain.handle("getStatus", async () => {
		return await updater.getStatus();
	});

	ipcMain.on("clip", async (event, text) => {
		clipboard.writeText(text);
	});

	ipcMain.on("updateCheck", () => {
		updater.check();
	});

	ipcMain.handle("active", (event, location) => {
		if (location == "get") return temp.activeLocation;
		temp.activeLocation = location;
	});

	ipcMain.handle("get", async (event, what, option) => {
		return await request.get(what, option);
	});

	ipcMain.handle("action", async (event, what, option) => {
		return await request.action(what, option);
	});
	ipcMain.handle("khaction", async (event, what, option) => {
		return await request.khaction(what, option);
	});

	ipcMain.handle("setUserRole", async (e, id, role) => {
		if (await database.setUserRole(id, role))
			request.updateInfo(null, null, temp.network);
	});

	ipcMain.handle("getDBLock", async (event, lockId, userId) => {});

	ipcMain.handle("lockId", async (event, lockId) => {
		if (lockId == "get") return temp.lockId;
		temp.lockId = lockId;
	});

	ipcMain.handle("lock", async (event, action) => {
		if (action == "get") return temp.lock;
		temp.lock = action;
	});
};
