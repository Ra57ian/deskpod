const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("deskpod", {
  load: () => ipcRenderer.invoke("store:load"),
  save: (data) => ipcRenderer.invoke("store:save", data),
  close: () => ipcRenderer.send("win:close"),
  minimize: () => ipcRenderer.send("win:minimize"),
  setAlwaysOnTop: (v) => ipcRenderer.send("win:toggle-top", v),
  ytSearch: (query) => ipcRenderer.invoke("yt:search", query),
});
