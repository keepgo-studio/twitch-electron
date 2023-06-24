import DB from "./db";
import { addSelfListener, sendToMainThread } from "./utils";

import type { AppPostEvents, AuthPostEvents, MainPostEvents, ProfilePostEvents, WorkerPostEvents } from "@utils/events";

const TWITCH_OAUTH_URL = "https://id.twitch.tv/oauth2";
const FBASE_FUNCTION_URL =
  "https://asia-northeast3-twitch-group.cloudfunctions.net";
// const FBASE_FUNCTION_URL = "http://127.0.0.1:5001/twitch-group/asia-northeast3";

abstract class ViewHandler {
  constructor() {
    this.listener();
  }
  abstract listener(): void;
}

export class ViewAppHandler extends ViewHandler {
  listener() {
    addSelfListener(async (e) => {
      const eventType = e.data.type as AppPostEvents;

      if (eventType === "get-userinfo-by-name") {
        const name = e.data.data;

        await DB.openUserDB(name);
        const tx = DB.userDB!.transaction("UserInfo", "readonly");

        const userInfo = await tx.store.get("root");

        const message: WebMessageForm<WorkerPostEvents> = {
          origin: "worker",
          type: "return-userinfo",
          data: userInfo
        }

        sendToMainThread(message);
      }
      else if (eventType === "sync-userinfo") {
        const userInfo = e.data.data;
        
        const tx = DB.userDB!.transaction("UserInfo", "readwrite");

        await tx.store.put(userInfo, "root");
      }
      else if (eventType === "check-access-token-valid") {
        const accessToken = e.data.data;

        const isValid = await fetch(`${TWITCH_OAUTH_URL}/validate`, {
          method: "GET",
          headers: {
            Authorization: "OAuth " + accessToken,
          },
        })
        .then((res) => (res.status === 200 ? true : false))
        .catch(() => false);

        const message: WebMessageForm<WorkerPostEvents> = {
          origin: "worker",
          type: "result-token-validation",
          data: isValid,
        };

        sendToMainThread(message);
      }
      else if (eventType === "sync-followed-list") {
        const { access_token, current_user_id } = e.data.data as TUserInfo;
        
        type TwitchChannelData = {
          broadcaster_id: string;
          broadcaster_login: string;
          broadcaster_name: string;
          followed_at: string;
        }
        let followList: Array<TwitchChannelData> = [];

        const { follow_list } = await fetch(
          `${FBASE_FUNCTION_URL}/getFollowList`,
          {
            method: "GET",
            headers: {
              access_token: access_token,
              current_user_id: current_user_id,
            } as any,
          }
        )
        .then((res) => res.json())
        .then((data) => data)
        .catch(() => { follow_list: [] })

        followList = follow_list;

        await Promise.all(followList.map(
          async ({
            broadcaster_id,
            broadcaster_name,
            broadcaster_login,
            followed_at,
          }: TwitchChannelData) => {
            const tx = DB.userDB!.transaction("Channels", "readwrite");

            return await tx.store
              .add(
                {
                  broadcaster_id: broadcaster_id,
                  broadcaster_name: broadcaster_name,
                  broadcaster_login: broadcaster_login,
                  followed_at: followed_at,
                },
                broadcaster_id
              )
              .then(async (result) => {
                const groupTx = DB.userDB!.transaction("Groups", "readwrite");

                const etcGroup = (await groupTx.store.get("etc"))!;

                etcGroup.channels.push(result);

                return await groupTx.store.put(etcGroup, "etc");
              })
              .catch(async (err) => {
                const channelTx = DB.userDB!.transaction("Channels", "readwrite");

                return await channelTx.store.put(
                  {
                    broadcaster_id: broadcaster_id,
                    broadcaster_name: broadcaster_name,
                    broadcaster_login: broadcaster_login,
                    followed_at: followed_at,
                  },
                  broadcaster_id
                );
              })
          }
        ),
      );

      const completeMessage: WebMessageForm<WorkerPostEvents> = {
        origin: "worker",
        type: "sync-complete-followed-list"
      }

      sendToMainThread(completeMessage);
    }
    else if (eventType === "get-followed-list") {
        const channelList = await DB.userDB!.transaction("Channels", "readonly").store.getAll();

        const followedMessage: WebMessageForm<WorkerPostEvents> = {
          origin: "worker",
          type: "return-followed-list",
          data: channelList
        }
    
        sendToMainThread(followedMessage);
      }
      else if (eventType === "get-group-list") {
        const groupList = await DB.userDB!.transaction("Groups", "readonly").store.getAll();
        const message: WebMessageForm<WorkerPostEvents> = {
          origin: "worker",
          type: "return-group-list",
          data: groupList
        }
        
        sendToMainThread(message);
      }
      else if (eventType === "get-stream-list") {
        type TwitchStreamData = {
          id: String;
          user_id: String;
          user_login: String;
          user_name: String;
          game_id: String;
          game_name: String;
          type: String;
          title: String;
          viewer_count: number;
          started_at: String;
          language: String;
          thumbnail_url: String;
          tag_ids: String[];
          tags: String[];
        }

        let streamList: Array<TwitchStreamData>;
        const { access_token, current_user_id } = e.data.data as TUserInfo;

        const { stream_list } = await fetch(
          `${FBASE_FUNCTION_URL}/getStreamsList`,
          {
            method: "GET",
            headers: {
              access_token: access_token,
              current_user_id: current_user_id,
            } as any,
          }
        )
        .then((res) => res.json())
        .then((data) => data)
        .catch(() => { stream_list: [] })

        streamList = stream_list;

        const streamMessage: WebMessageForm<WorkerPostEvents> = {
          origin: "worker",
          type: "return-stream-channels",
          data: streamList
        }
        sendToMainThread(streamMessage);
      }
    })
  }
}

export class ViewAuthHandler extends ViewHandler {
  saveUserProfile(username: string) {
    const tx = DB.profileDB?.transaction("Profiles", "readwrite");

    tx?.store.put({ username }, username);
  }

  listener(): void {
    addSelfListener(async (e) => {
      const eventType = e.data.type as AuthPostEvents;

      if (eventType === "open-user-db-to-worker") {
        const name = e.data.data;
        this.saveUserProfile(name);
        
        await DB.openUserDB(name);

        const message: WebMessageForm<WorkerPostEvents> = {
          origin: "worker",
          type: "after-open-user-db"
        }
        sendToMainThread(message);
      }
    })
  }  
}

export class ViewProfileHandler extends ViewHandler {
  listener(): void {
    addSelfListener(async (e) => {
      const eventType = e.data.type as ProfilePostEvents;

      if (eventType === "get-profiles") {
        const tx = DB.profileDB!.transaction("Profiles", "readonly");

        const allProfiles = await tx.store.getAll() ?? [];

        const message: WebMessageForm<WorkerPostEvents> = {
          origin: "worker",
          type: "return-profiles",
          data: allProfiles
        }
        
        sendToMainThread(message);
      }
    });
  }
}

export class ViewMainHandler extends ViewHandler {
  listener(): void {
    addSelfListener(async (e) => {
      const eventType = e.data.type as MainPostEvents;

      if (eventType === "append-new-group") {
        const tx = DB.userDB!.transaction("Groups", "readwrite");
        const groupName = e.data.data;

        const newGroup:TGroup = {
          channels: [],
          color: "",
          created_at: new Date().getTime().toString(),
          name: groupName
        };

        const result = await tx.store.add(newGroup, groupName)
          .then(() => true)
          .catch(() => false)
        
        const message: WebMessageForm<WorkerPostEvents> = {
          origin: "worker",
          type: "result-add-new-group",
        }

        // if group name exist
        if (!result) {
          console.log("already exist group name");
          message.data = undefined;
        }
        else {
          message.data = {
            groupName: groupName,
            allGroups: await tx.store.getAll()
          };
        }

        sendToMainThread(message);
      }
      else if (eventType === "save-aot-result") {
        const tx = DB.userDB!.transaction("UserInfo", "readwrite");
        const aot = e.data.data;

        const userInfo = (await tx.store.get("root"))!;

        userInfo.AOT = aot;
        
        await tx.store.put(userInfo, "root");

        const message: WebMessageForm<WorkerPostEvents> = {
          origin: "worker",
          type: "result-save-aot",
          data: aot
        }
        
        sendToMainThread(message);
      }
      else if (eventType === "change-group-name") {
        const tx = DB.userDB!.transaction("Groups", "readwrite");
        const { id, name } = e.data.data;

        const group: TGroup = (await tx.store.get(id))!;
        
        group.name = name;
        const result = await tx.store.add(group, name)
          .then(() => true)
          .catch(() => false)
        
        const message: WebMessageForm<WorkerPostEvents> = {
          origin: "worker",
          type: "result-changing-group-name",
        }

        // if group name exist
        if (!result) {
          console.log("already exist group name");
          message.data = undefined;
        }
        else {
          await tx.store.delete(id)
          message.data = name;
        }
        sendToMainThread(message);
      }
      else if (eventType === "change-player-mode") {
        const tx = DB.userDB!.transaction("UserInfo", "readwrite");
        const changeMode = e.data.data;

        const userInfo: TUserInfo = (await tx.store.get("root"))!;
        
        userInfo.mode = changeMode;
        
        await tx.store.put(userInfo, "root");
        const message:WebMessageForm<WorkerPostEvents> = {
          origin: "worker",
          type: "result-changing-player-mode",
          data: changeMode
        }
        sendToMainThread(message);
      }
    })
  }
}