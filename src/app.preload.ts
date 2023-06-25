import { contextBridge, ipcRenderer } from "electron";

function initAPI() {
  contextBridge.exposeInMainWorld("api", {
    openBrowser: (url: string) => {
      ipcRenderer.invoke("open-browser", url);
    },
  
    openPlayer: (channel: TChannel) => {
      ipcRenderer.invoke("open-player", channel);
    },

    onFollowEventListener: (callback: (type: "FollowButton_FollowUser" | "FollowButton_UnfollowUser", targetId: BroadcasterId) => void) => {
      ipcRenderer.on("follow-event-occur", (_, { type, targetId}) => {
        callback(type, targetId);
      })
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
}

function main() {
  initAPI();
}

main();