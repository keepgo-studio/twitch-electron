import { AppTag } from "@views/App";

import type { AppHandlingEvnets } from "@views/App";
import { WorkerHandlingEvents } from "worker";
type MainHandlingEvents = 
  "worker start" | 
  "return-access-token-valid" | 
  "return-user-info" |
  "return-follow-data";

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
      
      case "return-follow-data":
        appMsgType = "followed-channel-data";
    }

    if (appMsgType) {
      app.dispatchEvent(new CustomEvent(appMsgType, {
        detail: e.data.data
      }))
    }

  }

  window.api.updateUserCallback((userInfo) => {
    const appMsgType: AppHandlingEvnets = "return user-info from web";

    window.worker.postMessage({
      type: "store-user-info",
      data: userInfo
    } as WebMessageForm<WorkerHandlingEvents>)

    app.dispatchEvent(new CustomEvent(appMsgType, {
      detail: userInfo.username
    }))
  })
}

function main () {
  init();
}

main();