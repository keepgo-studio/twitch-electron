import { DBSchema, openDB } from "idb";

import type { MainHandlingEvents } from "index";
type WorkerHandlingEvents = "get-user-info" | "get-access-token-valid"
export type {
  WorkerHandlingEvents
}

const IDB_NAME = "TwitchPlayer";

const TWITCH_OAUTH_URL = "https://id.twitch.tv/oauth2";

type BroadcasterId = number;

interface PlayerIDB extends DBSchema {
  'UserInfo': {
    key: "root";
    value: UserInfo & {
      mode: "detach" | "player";
    };
  };

  'Groups': {
    key: string;
    value: {
      channels: Array<BroadcasterId>;
      color: string;
      created_at: string;
    };
  }

  /**
   * key is same as data.broadcaster_id
   * 
   * check response body structure 
   * https://dev.twitch.tv/docs/api/reference/#get-followed-channels
   */
  'Channels': {
    key: BroadcasterId;
    value: {
      broadcaster_login: string;
      followed_at: string
    }
  }
}

async function main() {
  const db = await openDB<PlayerIDB>(IDB_NAME, 1, {
    upgrade(_db) {
      const userStore = _db.createObjectStore("UserInfo");
      userStore.put({
        access_token: undefined,
        current_user_id: undefined,
        username: undefined,
        mode: "player",
      }, "root");

      const groupsStore = _db.createObjectStore("Groups");

      const channelsStore = _db.createObjectStore("Channels");
    }
  });

  onmessage = async (e: MessageEvent<WebMessageForm<WorkerHandlingEvents>>) => {
    let toMainMessage: WebMessageForm<MainHandlingEvents>;

    switch(e.data.type) {
      case "get-user-info":
        const tx = db.transaction("UserInfo", "readonly");

        const userInfo = await tx.store.get("root");
        await tx.done;
        toMainMessage = {
          type: "return-user-info",
          data: userInfo
        } as WebMessageForm<MainHandlingEvents>;
        break;
      
      case "get-access-token-valid":
        const token = e.data.data;

        const isValid = await fetch(`${TWITCH_OAUTH_URL}/validate`, {
          method: "GET",
          headers: {
            "Authorization": "OAuth " + token
          }
        })
        .then((res) => res.status === 200 ? true : false)
        .catch(() => false)

        toMainMessage = {
          type: "return-access-token-valid",
          data: isValid
        } as WebMessageForm<MainHandlingEvents>;
        break;
    }
    
    if (!toMainMessage.type) {
      throw new Error(`unhandle event from main thread. ${e.data.type}`)
    }

    postMessage(toMainMessage);
  }

  console.log("web worker on");
  
  postMessage({
    type: "worker start"
  } as WebMessageForm<MainHandlingEvents>)
}

main();