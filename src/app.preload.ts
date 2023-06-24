import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  openBrowser: (url: string) => {
    ipcRenderer.invoke("open-browser", url)
  },

  addTwitchAuthLitsener: (callback: (oidc: TwitchOIDCFromFirebase) => void) =>{
    ipcRenderer.on("update-user", (_, oidc) => {
        callback(oidc);
    })
  },

  updateWorking: (working: boolean) => {
    ipcRenderer.invoke("working", working)
  },

  syncAot: async (aot) => await ipcRenderer.invoke("sync-aot", aot)
} as PreloadAPI);
