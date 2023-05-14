import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  openBrowser: (url) => ipcRenderer.invoke("open-browser", url),

  updatePingTime: (callback:(pingTime: number) => void) => 
    ipcRenderer.on("update-ping", (_, time) => {
      callback(time);
    }),

  updateUserCallback: (callback: (userInfo: UserInfo) => void) =>
    ipcRenderer.on("update-user", (_, userInfo) => {
      callback(userInfo);
    }),

  updateConnectionCallback: (callback:() => void) => 
    ipcRenderer.on("update-connection", () => {
      callback();
    }),
} as PreloadAPI);
