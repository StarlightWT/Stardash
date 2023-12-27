const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
	loaded: () => ipcRenderer.invoke("loadStatus"),
	DBset: (id, what, role) => ipcRenderer.invoke("DBset", id, what, role),
	network: (status) => ipcRenderer.send("network", status),
	redirect: (page, modal) => ipcRenderer.send("redirect", page, modal),
	checkUpdate: () => ipcRenderer.send("updateCheck"),
	setClipboard: (text) => ipcRenderer.send("clip", text),
	getVersion: () => ipcRenderer.invoke("version"),
	getStatus: () => ipcRenderer.invoke("getStatus"),
	get: (what, option) => ipcRenderer.invoke("get", what, option),
	action: (what, option) => ipcRenderer.invoke("action", what, option),
	create: (what, option, option2) =>
		ipcRenderer.invoke("create", what, option, option2),
	moduleAction: (action, id, module) =>
		ipcRenderer.invoke("moduleAction", action, id, module),
	bootOnStart: (status) => ipcRenderer.invoke("bootOnStart", status),
	login: (email, password) => ipcRenderer.invoke("login", email, password),
	register: (username, email, password) =>
		ipcRenderer.invoke("register", username, email, password),
	available: (option) => ipcRenderer.invoke("availale", option),
	logout: () => ipcRenderer.invoke("logout"),
	lock: (id, what, option) => ipcRenderer.invoke("lock", id, what, option),
	tasks: (action, option) => ipcRenderer.invoke("tasks", action, option),
	set: (what, value) => ipcRenderer.send("set", what, value),
	tempGet: (what) => ipcRenderer.invoke("tempGet", what),
});
