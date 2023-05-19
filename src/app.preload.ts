import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  openBrowser: (url: string) => {
    ipcRenderer.invoke("open-browser", url)
  },

  updateUserCallback: (callback: (userInfo: TUserInfo) => void) =>{
    ipcRenderer.on("update-user", (_, userInfo) => {
        callback(userInfo);
    })
  },

  updateWorking: (working: boolean) => {
    ipcRenderer.invoke("working", working)
  },

  updateUserInfo: () => {},

  toggleAlwaysOnTop: async () => {
    const isAOT = await ipcRenderer.invoke("toggle-aot");

    return isAOT
  },
} as PreloadAPI);
