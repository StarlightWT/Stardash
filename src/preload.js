const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
	redirect: (page) => ipcRenderer.send("redirect", page),
	login: () => ipcRenderer.send("login"),
	addTime: (time) => ipcRenderer.send("addTime", time),
	remTime: (time) => ipcRenderer.send("remTime", time),
	loaded: () => ipcRenderer.invoke("loadStatus", 1),
	log: (title, description, role, colour, logIcon) =>
		ipcRenderer.send("log", title, description, role, colour, logIcon),
	logout: () => ipcRenderer.send("logout"),
	setClipboard: (text) => ipcRenderer.send("clip", text),
	getVersion: () => ipcRenderer.invoke("version"),
	getStatus: () => ipcRenderer.invoke("getStatus"),
	checkUpdate: () => ipcRenderer.send("updateCheck"),
	setUserRole: (id, role) => ipcRenderer.invoke("setUserRole", id, role),
	get: (what) => ipcRenderer.invoke("get", what),
	action: (what, option) => ipcRenderer.invoke("action", what, option),
});
