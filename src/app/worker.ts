import { DBSchema, openDB } from "idb";

import type { MainHandlingEvents } from "index";
type WorkerHandlingEvents = "get-user-info" | "get-access-token-valid" | "store-user-info" | "get-followed-channels"
export type {
  WorkerHandlingEvents
}

const IDB_NAME = "TwitchPlayer";

const TWITCH_OAUTH_URL = "https://id.twitch.tv/oauth2";
const FBASE_FUNCTION_URL = "https://asia-northeast3-twitch-group.cloudfunctions.net"

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
    let toMainMessage: WebMessageForm<MainHandlingEvents> | undefined;
    let tx, userInfo;

    switch(e.data.type) {
      case "get-user-info":
        tx = db.transaction("UserInfo", "readonly");

        userInfo = await tx.store.get("root");
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
      case "store-user-info":
        tx = db.transaction("UserInfo", "readwrite");
        
        userInfo = e.data.data as UserInfo;

        const mode = (await tx.store.get("root"))!.mode;

        await tx.store.put({
          "access_token": userInfo.access_token,
          "current_user_id": userInfo.current_user_id,
          "username": userInfo.username,
          mode
        }, "root");

        await tx.done;
        break;
      
      case "get-followed-channels":
        tx = db.transaction("UserInfo", "readwrite");
        
        userInfo = await tx.store.get("root");
        await tx.done;

        const channelsList = await fetch(`${FBASE_FUNCTION_URL}/getFollowList`, {
          method: "GET",
          headers: {
            "access_token": userInfo!.access_token,
            "current_user_id": userInfo!.current_user_id
          } as any
        })
        .then((res) => res.json())
        .then((data) => data)
        .catch(() => []);

        toMainMessage = {
          type: "return-follow-data",
          data: channelsList
        } as WebMessageForm<MainHandlingEvents>;
        break;
    }

    if (!toMainMessage) {
      return;
    }
    
    postMessage(toMainMessage);
  }

  console.log("web worker on");
  
  postMessage({
    type: "worker start"
  } as WebMessageForm<MainHandlingEvents>)
}

main();