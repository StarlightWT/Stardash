const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
	redirect: (page, modal) => ipcRenderer.send("redirect", page, modal),
	loaded: () => ipcRenderer.invoke("loadStatus"),
	setClipboard: (text) => ipcRenderer.send("clip", text),
	getVersion: () => ipcRenderer.invoke("version"),
	getStatus: () => ipcRenderer.invoke("getStatus"),
	checkUpdate: () => ipcRenderer.send("updateCheck"),
	setUserRole: (id, role) => ipcRenderer.invoke("setUserRole", id, role),
	get: (what) => ipcRenderer.invoke("get", what),
	action: (what, option) => ipcRenderer.invoke("action", what, option),
	khaction: (what, option) => ipcRenderer.invoke("khaction", what, option),
	taskAction: (action, option) =>
		ipcRenderer.invoke("taskAction", action, option),
	active: (location) => ipcRenderer.invoke("active", location),
	updateSettings: () => ipcRenderer.invoke("updateSettings"),
	network: (status) => ipcRenderer.send("network", status),
	lockId: (lockId) => ipcRenderer.invoke("lockId", lockId),
	lock: (action) => ipcRenderer.invoke("lock", action),
	getDBLock: (lockId, userId) =>
		ipcRenderer.invoke("getDBLock", lockId, userId),
	bootOnStart: (status) => ipcRenderer.invoke("bootOnStart", status),
	toggleModule: (id, module) => ipcRenderer.invoke("toggleModule", id, module),
	DBLock: (action) => ipcRenderer.invoke("DBlock", action),
	lockModule: (DBLock, module) =>
		ipcRenderer.invoke("lockModule", DBLock, module),
	//NEW SHIT
	login: (email, password) => ipcRenderer.invoke("login", email, password),
	register: (username, email, password) =>
		ipcRenderer.invoke("register", username, email, password),
	available: (option) => ipcRenderer.invoke("availale", option),
	logout: () => ipcRenderer.invoke("logout"),
});
