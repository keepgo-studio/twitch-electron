import { DBSchema, openDB } from "idb";

import type { MainHandlingEvents } from "index";
import type { MainViewHandlingEvents } from "@views/main/Main";

type WorkerHandlingEvents =
  | "get-user-info"
  | "get-access-token-valid"
  | "store-user-info"
  | "get-followed-channels"
  | "save-AOT"
  | "change-group-name"
  | "append-new-group"
  | "get-store-group-list"
  ;
export type { WorkerHandlingEvents };

const IDB_NAME = "TwitchPlayer";

const TWITCH_OAUTH_URL = "https://id.twitch.tv/oauth2";
const FBASE_FUNCTION_URL =
  "https://asia-northeast3-twitch-group.cloudfunctions.net";
// const FBASE_FUNCTION_URL = "http://127.0.0.1:5001/twitch-group/asia-northeast3";

interface PlayerIDB extends DBSchema {
  UserInfo: {
    key: "root";
    value: TUserInfo;
  };

  Groups: {
    key: number;
    value: TGroup;
  };

  /**
   * key is same as data.broadcaster_id
   *
   * check response body structure
   * https://dev.twitch.tv/docs/api/reference/#get-followed-channels
   */
  Channels: {
    key: BroadcasterId;
    value: TChannel;
  };
}

async function main() {
  const db = await openDB<PlayerIDB>(IDB_NAME, 1, {
    upgrade(_db) {
      const userStore = _db.createObjectStore("UserInfo");
      userStore.add(
        {
          access_token: undefined,
          current_user_id: undefined,
          username: undefined,
          mode: "player",
          AOT: true
        },
        "root"
      );

      const groupsStore = _db.createObjectStore("Groups", {
        autoIncrement: true
      });

      groupsStore.add(
        {
          name: "etc",
          channels: [],
          color: "#9146FF",
          created_at: new Date().getTime().toString(),
        });
      const channelsStore = _db.createObjectStore("Channels");
    },
  });

  onmessage = async (e: MessageEvent<WebMessageForm<WorkerHandlingEvents>>) => {
    let toMainMessage: WebMessageForm<MainHandlingEvents> | WebMessageForm<MainViewHandlingEvents> | undefined;

    if (e.data.type === "get-user-info") {
      const tx = db.transaction("UserInfo", "readonly");

      const userInfo = await tx.store.get("root");

      await tx.done;
      toMainMessage = {
        type: "return-user-info",
        data: userInfo,
      } as WebMessageForm<MainHandlingEvents>;
    } else if (e.data.type === "get-access-token-valid") {
      const token = e.data.data;

      const isValid = await fetch(`${TWITCH_OAUTH_URL}/validate`, {
        method: "GET",
        headers: {
          Authorization: "OAuth " + token,
        },
      })
        .then((res) => (res.status === 200 ? true : false))
        .catch(() => false);

      toMainMessage = {
        type: "return-access-token-valid",
        data: isValid,
      } as WebMessageForm<MainHandlingEvents>;
    } else if (e.data.type === "store-user-info") {
      const tx = db.transaction("UserInfo", "readwrite");

      const userInfo = e.data.data as TUserInfo;

      const { mode, AOT } = (await tx.store.get("root"))!;

      await tx.store.put(
        {
          access_token: userInfo.access_token,
          current_user_id: userInfo.current_user_id,
          username: userInfo.username,
          mode,
          AOT
        },
        "root"
      );

      await tx.done;
    } else if (e.data.type === "get-followed-channels") {
      const tx1 = db.transaction("UserInfo", "readwrite");

      const userInfo = await tx1.store.get("root");
      tx1.done;

      const { follow_list } = await fetch(
        `${FBASE_FUNCTION_URL}/getFollowList`,
        {
          method: "GET",
          headers: {
            access_token: userInfo!.access_token,
            current_user_id: userInfo!.current_user_id,
          } as any,
        }
      )
        .then((res) => res.json())
        .then((data) => data)
        .catch(() => []);

      const { stream_list } = await fetch(
        `${FBASE_FUNCTION_URL}/getStreamsList`,
        {
          method: "GET",
          headers: {
            access_token: userInfo!.access_token,
            current_user_id: userInfo!.current_user_id,
          } as any,
        }
      )
      .then((res) => res.json())
      .then((data) => data)
      .catch(() => []);

      await Promise.all(follow_list.map(
          async (channel: {
            broadcaster_id: string;
            broadcaster_login: string;
            broadcaster_name: string;
            followed_at: string;
          }) => {
            const tx2 = db.transaction("Channels", "readwrite");

            return await tx2.store
              .add(
                {
                  broadcaster_id: channel.broadcaster_id,
                  broadcaster_name: channel.broadcaster_name,
                  broadcaster_login: channel.broadcaster_login,
                  followed_at: channel.followed_at,
                },
                channel.broadcaster_id
              )
              .then(async (result) => {
                const tx3 = db.transaction("Groups", "readwrite");

                const etcGroup = (await tx3.store.get(1))!;

                etcGroup.channels.push(result);

                return await tx3.store.put(etcGroup, 1);
              })
              .catch(async (err) => {
                const tx3 = db.transaction("Channels", "readwrite");

                return await tx3.store.put(
                  {
                    broadcaster_id: channel.broadcaster_id,
                    broadcaster_name: channel.broadcaster_name,
                    broadcaster_login: channel.broadcaster_login,
                    followed_at: channel.followed_at,
                  },
                  channel.broadcaster_id
                );
              })
          }
        ),
      );

      const group_list = await db.transaction("Groups", "readonly").store.getAll();

      toMainMessage = {
        type: "return-follow-data",
        data: {
          follow_list,
          stream_list,
          group_list
        },
      } as WebMessageForm<MainHandlingEvents>;
    }
    else if (e.data.type === "save-AOT") {
      const AOT = e.data.data;
      const tx = db.transaction("UserInfo", "readwrite");
      const userInfo = await tx.store.get("root");

      if (!userInfo) {
        console.error("cannot get userInfo data from IndexedDB via \"save-AOT\" event");
        return;
      }
      userInfo.AOT = AOT;
      await tx.store.put(userInfo, "root");
    }
    else if (e.data.type === "append-new-group") {
      const tx = db.transaction("Groups", "readwrite");
      const newGroupName = e.data.data;
  
      const group: TGroup = {
        channels: [],
        color: "#9146FF",
        created_at: new Date().getTime().toString(),
        name: newGroupName
      }
  
      const result = await tx.store.put(group)
        .then(() => true)
        .catch(() => false)
      
      toMainMessage = {
        type: "append group result",
        data: result,
      } as WebMessageForm<MainViewHandlingEvents>;
    }
    else if (e.data.type === "get-store-group-list") {
      const tx = db.transaction("Groups", "readwrite");
      const groupList = await tx.store.getAll();

      postMessage({
        type: "getting group list result",
        data: groupList
      } as WebMessageForm<MainViewHandlingEvents>);
    }

    if (!toMainMessage) {
      return;
    }

    postMessage(toMainMessage);
  };

  console.log("web worker on");

  postMessage({
    type: "worker start",
  } as WebMessageForm<MainHandlingEvents>);
}

main();
