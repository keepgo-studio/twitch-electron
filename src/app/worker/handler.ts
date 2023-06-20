import DB from "./db";
import { addSelfListener, sendToMainThread } from "./utils";

import type { AppPostEvents, AuthPostEvents, ProfilePostEvents, WorkerPostEvents } from "@utils/events";

const TWITCH_OAUTH_URL = "https://id.twitch.tv/oauth2";
const FBASE_FUNCTION_URL =
  "https://asia-northeast3-twitch-group.cloudfunctions.net";
// const FBASE_FUNCTION_URL = "http://127.0.0.1:5001/twitch-group/asia-northeast3";

// onmessage = async (e: MessageEvent<WebMessageForm<WorkerHandlingEvents>>) => {
  //   let toMainMessage: WebMessageForm<MainHandlingEvents> | WebMessageForm<MainViewHandlingEvents> | undefined;

  //   if (e.data.type === "get-user-info") {
  //     const tx = db.transaction("UserInfo", "readonly");

  //     const userInfo = await tx.store.get("root");

  //     await tx.done;
  //     toMainMessage = {
  //       type: "return-user-info",
  //       data: userInfo,
  //     } as WebMessageForm<MainHandlingEvents>;
  //   } else if (e.data.type === "get-access-token-valid") {
  //     const token = e.data.data;

  //     const isValid = await fetch(`${TWITCH_OAUTH_URL}/validate`, {
  //       method: "GET",
  //       headers: {
  //         Authorization: "OAuth " + token,
  //       },
  //     })
  //       .then((res) => (res.status === 200 ? true : false))
  //       .catch(() => false);

  //     toMainMessage = {
  //       type: "return-access-token-valid",
  //       data: isValid,
  //     } as WebMessageForm<MainHandlingEvents>;
  //   } else if (e.data.type === "store-user-info") {
  //     const tx = db.transaction("UserInfo", "readwrite");

  //     const userInfo = e.data.data as TUserInfo;

  //     const { mode, AOT } = (await tx.store.get("root"))!;

  //     await tx.store.put(
  //       {
  //         access_token: userInfo.access_token,
  //         current_user_id: userInfo.current_user_id,
  //         username: userInfo.username,
  //         mode,
  //         AOT
  //       },
  //       "root"
  //     );

  //     await tx.done;
  //   } else if (e.data.type === "get-followed-channels") {
  //     const tx1 = db.transaction("UserInfo", "readwrite");

  //     const userInfo = await tx1.store.get("root");
  //     tx1.done;

  //     const { follow_list } = await fetch(
  //       `${FBASE_FUNCTION_URL}/getFollowList`,
  //       {
  //         method: "GET",
  //         headers: {
  //           access_token: userInfo!.access_token,
  //           current_user_id: userInfo!.current_user_id,
  //         } as any,
  //       }
  //     )
  //       .then((res) => res.json())
  //       .then((data) => data)
  //       .catch(() => []);

  //     const { stream_list } = await fetch(
  //       `${FBASE_FUNCTION_URL}/getStreamsList`,
  //       {
  //         method: "GET",
  //         headers: {
  //           access_token: userInfo!.access_token,
  //           current_user_id: userInfo!.current_user_id,
  //         } as any,
  //       }
  //     )
  //     .then((res) => res.json())
  //     .then((data) => data)
  //     .catch(() => []);

  //     await Promise.all(follow_list.map(
  //         async (channel: {
  //           broadcaster_id: string;
  //           broadcaster_login: string;
  //           broadcaster_name: string;
  //           followed_at: string;
  //         }) => {
  //           const tx2 = db.transaction("Channels", "readwrite");

  //           return await tx2.store
  //             .add(
  //               {
  //                 broadcaster_id: channel.broadcaster_id,
  //                 broadcaster_name: channel.broadcaster_name,
  //                 broadcaster_login: channel.broadcaster_login,
  //                 followed_at: channel.followed_at,
  //               },
  //               channel.broadcaster_id
  //             )
  //             .then(async (result) => {
  //               const tx3 = db.transaction("Groups", "readwrite");

  //               const etcGroup = (await tx3.store.get(1))!;

  //               etcGroup.channels.push(result);

  //               return await tx3.store.put(etcGroup, 1);
  //             })
  //             .catch(async (err) => {
  //               const tx3 = db.transaction("Channels", "readwrite");

  //               return await tx3.store.put(
  //                 {
  //                   broadcaster_id: channel.broadcaster_id,
  //                   broadcaster_name: channel.broadcaster_name,
  //                   broadcaster_login: channel.broadcaster_login,
  //                   followed_at: channel.followed_at,
  //                 },
  //                 channel.broadcaster_id
  //               );
  //             })
  //         }
  //       ),
  //     );

  //     const group_list = await db.transaction("Groups", "readonly").store.getAll();

  //     toMainMessage = {
  //       type: "return-follow-data",
  //       data: {
  //         follow_list,
  //         stream_list,
  //         group_list
  //       },
  //     } as WebMessageForm<MainHandlingEvents>;
  //   }
  //   else if (e.data.type === "save-AOT") {
  //     const AOT = e.data.data;
  //     const tx = db.transaction("UserInfo", "readwrite");
  //     const userInfo = await tx.store.get("root");

  //     if (!userInfo) {
  //       console.error("cannot get userInfo data from IndexedDB via \"save-AOT\" event");
  //       return;
  //     }
  //     userInfo.AOT = AOT;
  //     await tx.store.put(userInfo, "root");
  //   }
  //   else if (e.data.type === "append-new-group") {
  //     const tx = db.transaction("Groups", "readwrite");
  //     const newGroupName = e.data.data;
  
  //     const group: TGroup = {
  //       channels: [],
  //       color: "#9146FF",
  //       created_at: new Date().getTime().toString(),
  //       name: newGroupName
  //     }
  
  //     const result = await tx.store.put(group)
  //       .then(() => true)
  //       .catch(() => false)
      
  //     toMainMessage = {
  //       type: "append group result",
  //       data: result,
  //     } as WebMessageForm<MainViewHandlingEvents>;
  //   }
  //   else if (e.data.type === "get-store-group-list") {
  //     const tx = db.transaction("Groups", "readwrite");
  //     const groupList = await tx.store.getAll();

  //     postMessage({
  //       type: "getting group list result",
  //       data: groupList
  //     } as WebMessageForm<MainViewHandlingEvents>);
  //   }

  //   if (!toMainMessage) {
  //     return;
  //   }

  //   postMessage(toMainMessage);
  // };


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