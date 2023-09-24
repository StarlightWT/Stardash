const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  redirect: (page) => ipcRenderer.send("redirect", page),
  login: () => ipcRenderer.send("login"),
  getProfile: () => ipcRenderer.invoke("getProfile"),
  getLock: () => ipcRenderer.invoke("getLock"),
  getLockHistory: (lockID) => ipcRenderer.invoke("getLockHistory", lockID),
  getExtension: (userID) => ipcRenderer.invoke("connectStardash", userID),
  addTime: (time) => ipcRenderer.send("addTime", time),
  remTime: (time) => ipcRenderer.send("remTime", time),
  casinoSelect: (id) => ipcRenderer.send("casino", id),
  log: (title, description, role, colour, logIcon) => ipcRenderer.send("log", title, description, role, colour, logIcon),
  logout: () => ipcRenderer.send("logout"),
});