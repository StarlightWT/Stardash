const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  redirect: () => ipcRenderer.send("redirect"),
  login: () => ipcRenderer.send("login"),
  getProfile: () => ipcRenderer.invoke("getProfile"),
});
