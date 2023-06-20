import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  openBrowser: (url: string) => {
    ipcRenderer.invoke("open-browser", url)
  },

  addTwitchAuthLitsener: (callback: (userInfo: TUserInfo) => void) =>{
    ipcRenderer.on("update-user", (_, userInfo) => {
        callback(userInfo);
    })
  },

  updateWorking: (working: boolean) => {
    ipcRenderer.invoke("working", working)
  },

  syncAot: async (aot) => await ipcRenderer.invoke("sync-aot", aot)
} as PreloadAPI);
