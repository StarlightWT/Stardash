console.log(`[IPC Handler] Loaded!`);
const { clipboard } = require("electron");
const updater = require("./updater.js");
const {
	login,
	register,
	availale,
	logout,
} = require("./login/login_handler.js");

const { get, lockAction, tasks, create, set } = require("./db_handler.js");

module.exports = (ipcMain, temp, win) => {
	ipcMain.handle("action", async (event, what, option) => {
		return await action(what, option);
	});

	ipcMain.handle("tasks", async (event, action, options) => {
		return await tasks(action, options);
	});

	ipcMain.handle("login", async (event, email, password) => {
		return await login(email, password, temp);
	});

	ipcMain.handle("register", async (event, username, email, password) => {
		return await register(username, email, password, temp);
	});

	ipcMain.handle("availale", async (event, option) => {
		return await availale(option);
	});
	ipcMain.handle("logout", (event) => {
		return logout(win, temp);
	});

	ipcMain.handle("get", async (event, what, option) => {
		return await get(what, option);
	});

	ipcMain.handle("lock", async (event, id, what, option) => {
		if (!id) id = temp.get("actionLockID");
		return await lockAction(id, what, option);
	});

	ipcMain.handle("create", async (event, what, option, option2) => {
		return await create(what, option, option2);
	});

	ipcMain.handle("bootOnStart", async (event, status) => {
		if (status == "get") return temp.get("bootOnStart");
		if (status) return temp.set("bootOnStart", true);
		if (!status) return temp.set("bootOnStart", false);
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

	ipcMain.handle("DBset", async (e, id, what, role) => {
		return await set(id, what, role);
	});

	ipcMain.on("set", (e, what, newValue) => {
		console.log(what);
		console.log(newValue);
		temp.set(what, newValue);
	});
};
