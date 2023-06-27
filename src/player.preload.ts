import { contextBridge, ipcRenderer } from "electron";

function initAPI() {
  contextBridge.exposeInMainWorld("api", {
    hideWindowLitsener: (callback: () => void) =>{
      ipcRenderer.on("hide-window", () => {
          callback();
      })
    },
  
    syncAot: async (aot: boolean) => await ipcRenderer.invoke("sync-aot", {
      renderer: "player",
      aot
    })
  });
}

function main() {
  initAPI();
}

main();