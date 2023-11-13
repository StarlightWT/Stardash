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
});
