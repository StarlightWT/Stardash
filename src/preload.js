const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  redirect: (page) => ipcRenderer.send("redirect", page),
  login: () => ipcRenderer.send("login"),
  getProfile: () => ipcRenderer.invoke("getProfile"),
  getLock: () => ipcRenderer.invoke("getLock"),
  getLockHistory: (lockID) => ipcRenderer.invoke("getLockHistory", lockID),
  logout: () => ipcRenderer.send("logout"),
  casinoSelect: (id) => ipcRenderer.send("casino", id),
});
