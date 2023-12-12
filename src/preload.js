const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
	redirect: (page, modal) => ipcRenderer.send("redirect", page, modal),
	loaded: () => ipcRenderer.invoke("loadStatus"),
	logout: () => ipcRenderer.send("logout"),
	setClipboard: (text) => ipcRenderer.send("clip", text),
	getVersion: () => ipcRenderer.invoke("version"),
	getStatus: () => ipcRenderer.invoke("getStatus"),
	checkUpdate: () => ipcRenderer.send("updateCheck"),
	setUserRole: (id, role) => ipcRenderer.invoke("setUserRole", id, role),
	get: (what) => ipcRenderer.invoke("get", what),
	action: (what, option) => ipcRenderer.invoke("action", what, option),
	khaction: (what, option) => ipcRenderer.invoke("khaction", what, option),
	active: (location) => ipcRenderer.invoke("active", location),
	updateSettings: () => ipcRenderer.invoke("updateSettings"),
	createWeheel: (container, props) =>
		ipcRenderer.invoke("createWheel", container, props),
	network: (status) => ipcRenderer.send("network", status),
	lockId: (lockId) => ipcRenderer.invoke("lockId", lockId),
	lock: (action) => ipcRenderer.invoke("lock", action),
	getDBLock: (lockId, userId) =>
		ipcRenderer.invoke("getDBLock", lockId, userId),
	bootOnStart: (status) => ipcRenderer.invoke("bootOnStart", status),
	assignTask: (lockId, taskTitle) =>
		ipcRenderer.invoke("assignTask", lockId, taskTitle),
	unassignTask: (lockId, taskTitle) =>
		ipcRenderer.invoke("unassignTask", lockId, taskTitle),
	logTask: (lockId, log) => ipcRenderer.invoke("logTask", lockId, log),
	toggleModule: (id, module) => ipcRenderer.invoke("toggleModule", id, module),
	addTask: (id, task) => ipcRenderer.invoke("addTask", id, task),
});
