import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  openBrowser: (url) => ipcRenderer.invoke("open-browser", url),

  updateUser: (callback: (userInfo: UserInfo) => void) =>
    ipcRenderer.on("update-user", (_, userInfo) => {
      callback(userInfo);
    }),

} as PreloadAPI);
