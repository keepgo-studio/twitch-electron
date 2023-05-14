import { AppTag } from "@views/App";

import type { AppHandlingEvnets } from "@views/App";
type MainHandlingEvents = "worker start" | "return-access-token-valid" | "return-user-info";
export type {
  MainHandlingEvents
};

const app = document.createElement(AppTag);

function init() {
  window.worker = new Worker("/app/worker.js");

  window.worker.onmessage = (e: MessageEvent<WebMessageForm<MainHandlingEvents>>) => {
    let appMsgType: AppHandlingEvnets | undefined;

    switch(e.data.type) {
      case "worker start":
        document.body.append(app);
        break;
      case "return-user-info":
        appMsgType = "user-update"
        break;

      case "return-access-token-valid":
        appMsgType = "access-token-valid"
        break;
    }

    if (appMsgType) {
      app.dispatchEvent(new CustomEvent(appMsgType, {
        detail: e.data.data
      }))
    }

  }

  window.api.updatePingTime((pingTime) => {
    window.pingTime = pingTime;
  });

  window.api.updateUserCallback((userInfo) => {
    const appMsgType: AppHandlingEvnets = "return userInfo from web";

    // window.worker.postMessage({
    //   type: "store userInfo"
    //   data: userInfo
    // })
    
    app.dispatchEvent(new CustomEvent(appMsgType))
  })

  window.api.updateConnectionCallback(() => {
    const appMsgType: AppHandlingEvnets = "update connection";
    app.dispatchEvent(new CustomEvent(appMsgType))
  })
}

function main () {
  init();
}

main();