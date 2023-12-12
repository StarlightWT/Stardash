console.log(`[IPC Handler] Loaded!`);
const request = require("./api_handler.js");
const { clipboard } = require("electron");
const database = require("./db_handler.js");
const updater = require("./updater.js");

module.exports = (ipcMain, temp) => {
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
		if (location == "get") return temp.get("activeLocation");
		temp.set("activeLocation", location);
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

	ipcMain.handle("getDBLock", async (event, lockId, userId) => {
		let filter;
		if (lockId) filter = { id: lockId };
		if (userId) filter = { userId: userId };
		return await database.getLock(filter);
	});

	ipcMain.handle("lockId", async (event, lockId) => {
		if (lockId == "get") return temp.get("lockId");
		temp.set("lockId", lockId);
	});

	ipcMain.handle("lock", async (event, lock) => {
		if (lock == "get") return temp.get("lock");
		temp.set("lock", lock);
	});

	ipcMain.handle("bootOnStart", async (event, status) => {
		if (status == "get") return temp.get("bootOnStart");
		if (status) return temp.set("bootOnStart", true);
		if (!status) return temp.set("bootOnStart", false);
	});

	ipcMain.handle("toggleModule", async (event, id, module) => {
		return await database.toggleModule(id, module);
	});

	ipcMain.handle("DBlock", async (event, action) => {
		if (action == "get") return temp.get("DBlock");
		else temp.set("DBlock", action);
	});

	ipcMain.handle("taskAction", async (event, action, options) => {
		return await database.taskAction(action, options);
	});
};
