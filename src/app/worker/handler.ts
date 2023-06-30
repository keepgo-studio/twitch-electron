import DB from "./db";
import { addSelfListener, sendToMainThread } from "./utils";

import type {
  AddChannelsPostEvents,
  AppPostEvents,
  AuthPostEvents,
  GroupPostEvents,
  MainPostEvents,
  ProfilePostEvents,
  WorkerPostEvents,
} from "@utils/events";

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
          data: userInfo,
        };

        sendToMainThread(message);
      } else if (eventType === "sync-userinfo") {
        const userInfo = e.data.data;

        const tx = DB.userDB!.transaction("UserInfo", "readwrite");

        await tx.store.put(userInfo, "root");
      } else if (eventType === "check-access-token-valid") {
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
      } else if (eventType === "sync-followed-list") {
        const { access_token, current_user_id } = e.data.data as TUserInfo;

        type TwitchChannelData = {
          broadcaster_id: string;
          broadcaster_login: string;
          broadcaster_name: string;
          followed_at: string;
        };
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
          .catch(() => {
            follow_list: [];
          });

        followList = follow_list;

        const groupTx = DB.userDB!.transaction("Groups", "readwrite");
        let gcursor = await groupTx.store.openCursor();

        while (gcursor) {
          gcursor.value.channels = [];
          await gcursor.update(gcursor.value);
          gcursor = await gcursor.continue();
        }

        const channelsGetTx = DB.userDB!.transaction("Channels", "readonly");

        const channels = await channelsGetTx.store.getAll();

        const newChannels: Array<TChannel> = await Promise.all(
          followList.map(async (_channel) => {
            const findChannel = channels!.find(
              (_ch) => _ch.broadcaster_id === _channel.broadcaster_id
            );

            const tx = DB.userDB!.transaction("Groups", "readwrite");

            if (findChannel === undefined) {
              const etcGroup = await tx.store.get("etc");

              etcGroup!.channels.push(_channel.broadcaster_id);
              tx.store.put(etcGroup!, "etc");

              return {
                broadcaster_id: _channel.broadcaster_id,
                broadcaster_login: _channel.broadcaster_login,
                broadcaster_name: _channel.broadcaster_name,
                followed_at: _channel.followed_at,
                group_id: "etc",
              } as TChannel;
            }

            const group = await tx.store.get(findChannel.group_id);
            group!.channels.push(findChannel.broadcaster_id);
            await tx.store.put(group!, group!.name);

            return findChannel;
          })
        );

        const removeTx = DB.userDB!.transaction("Channels", "readwrite");
        await removeTx.store.clear();

        await Promise.all(
          newChannels.map((_channel) => {
            const tx = DB.userDB!.transaction("Channels", "readwrite");

            tx.store.add(_channel, _channel.broadcaster_id);
          })
        );

        const completeMessage: WebMessageForm<WorkerPostEvents> = {
          origin: "worker",
          type: "sync-complete-followed-list",
        };

        sendToMainThread(completeMessage);
      } else if (eventType === "get-followed-list") {
        const channelList = await DB.userDB!.transaction(
          "Channels",
          "readonly"
        ).store.getAll();

        const followedMessage: WebMessageForm<WorkerPostEvents> = {
          origin: "worker",
          type: "return-followed-list",
          data: channelList,
        };

        sendToMainThread(followedMessage);
      } else if (eventType === "get-group-list") {
        const groupList = await DB.userDB!.transaction(
          "Groups",
          "readonly"
        ).store.getAll();
        const message: WebMessageForm<WorkerPostEvents> = {
          origin: "worker",
          type: "return-group-list",
          data: groupList,
        };

        sendToMainThread(message);
      } else if (eventType === "get-stream-list") {
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
        };

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
          .catch(() => {
            stream_list: [];
          });

        streamList = stream_list;

        const streamMessage: WebMessageForm<WorkerPostEvents> = {
          origin: "worker",
          type: "return-stream-channels",
          data: streamList,
        };
        sendToMainThread(streamMessage);
      }
    });
  }
}

export class ViewAuthHandler extends ViewHandler {
  async saveUserProfile(userInfo: TUserInfo) {
    const twitchUserInfo:{
      id: BroadcasterId;
      profile_image_url: string;
      offline_image_url: string;
    } = await fetch(
      `${FBASE_FUNCTION_URL}/getUserInfo`,
      {
        method: "GET",
        headers: {
          access_token: userInfo.access_token,
          current_user_id: userInfo.current_user_id,
        } as any,
      }
    )
      .then((res) => res.json())
      .then((data) => data["user_info"].data[0])
      .catch(() => ({
        offline_image_url: "",
        profile_image_url: ""
      }));
    
    const tx = DB.profileDB?.transaction("Profiles", "readwrite");

    tx?.store.put({ 
      username: userInfo.username!,
      offline_image_url: twitchUserInfo.offline_image_url,
      profile_image_url: twitchUserInfo.profile_image_url
    }, userInfo.username);
  }

  listener(): void {
    addSelfListener(async (e) => {
      const eventType = e.data.type as AuthPostEvents;

      if (eventType === "open-user-db-to-worker") {
        const userInfo:TUserInfo = e.data.data;
        this.saveUserProfile(userInfo);

        await DB.openUserDB(userInfo.username);

        const message: WebMessageForm<WorkerPostEvents> = {
          origin: "worker",
          type: "after-open-user-db",
        };
        sendToMainThread(message);
      }
    });
  }
}

export class ViewProfileHandler extends ViewHandler {
  listener(): void {
    addSelfListener(async (e) => {
      const eventType = e.data.type as ProfilePostEvents;

      if (eventType === "get-profiles") {
        const tx = DB.profileDB!.transaction("Profiles", "readonly");

        const allProfiles = (await tx.store.getAll()) ?? [];

        const message: WebMessageForm<WorkerPostEvents> = {
          origin: "worker",
          type: "return-profiles",
          data: allProfiles,
        };

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

        const newGroup: TGroup = {
          channels: [],
          color: "",
          created_at: new Date().getTime().toString(),
          name: groupName,
        };

        const result = await tx.store
          .add(newGroup, groupName)
          .then(() => true)
          .catch(() => false);

        const message: WebMessageForm<WorkerPostEvents> = {
          origin: "worker",
          type: "result-add-new-group",
        };

        // if group name exist
        if (!result) {
          console.error("already exist group name");
          message.data = undefined;
        } else {
          message.data = {
            groupName: groupName,
            allGroups: await tx.store.getAll(),
          };
        }

        sendToMainThread(message);
      } else if (eventType === "save-aot-result") {
        const tx = DB.userDB!.transaction("UserInfo", "readwrite");
        const aot = e.data.data;

        const userInfo = (await tx.store.get("root"))!;

        userInfo.AOT = aot;

        await tx.store.put(userInfo, "root");

        const message: WebMessageForm<WorkerPostEvents> = {
          origin: "worker",
          type: "result-save-aot",
          data: aot,
        };

        sendToMainThread(message);
      } else if (eventType === "change-group-name") {
        const tx = DB.userDB!.transaction("Groups", "readwrite");
        const { id, name } = e.data.data;

        const group: TGroup = (await tx.store.get(id))!;
        const oldGroupName = group.name;

        group.name = name;

        const result = await tx.store
          .add(group, name)
          .then(() => true)
          .catch(() => false);

        const newChannels: Array<TChannel> = [];
        if (result) {
          const channelTx = DB.userDB!.transaction("Channels", "readwrite");

          let cursor = await channelTx.store.openCursor();

          while (cursor) {
            if (cursor.value.group_id === oldGroupName) {
              cursor.value.group_id = name;
              await cursor.update(cursor.value);
            }
            newChannels.push(cursor.value);
            cursor = await cursor.continue();
          }
        }

        const message: WebMessageForm<WorkerPostEvents> = {
          origin: "worker",
          type: "result-changing-group-name",
        };

        // if group name exist
        if (!result) {
          console.log("already exist group name");
          message.data = undefined;
        } else {
          const deleteTx = DB.userDB!.transaction("Groups", "readwrite");
          await deleteTx.store.delete(id);
          message.data = {
            newChannels,
            newName: name,
          };
        }
        sendToMainThread(message);
      } else if (eventType === "change-group-color") {
        const tx = DB.userDB!.transaction("Groups", "readwrite");
        const { groupId, color } = e.data.data;

        const group: TGroup = (await tx.store.get(groupId))!;
        group.color = color;

        await tx.store.put(group, groupId);
        const message: WebMessageForm<WorkerPostEvents> = {
          origin: "worker",
          type: "result-changing-group-color",
          data: {
            groupId,
            color,
          },
        };
        sendToMainThread(message);
      } else if (eventType === "sync-twitch-followed-list") {
        const { access_token, current_user_id } = e.data.data as TUserInfo;

        type TwitchChannelData = {
          broadcaster_id: string;
          broadcaster_login: string;
          broadcaster_name: string;
          followed_at: string;
        };
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
          .catch(() => {
            follow_list: [];
          });

        followList = follow_list;

        const groupTx = DB.userDB!.transaction("Groups", "readwrite");
        let gcursor = await groupTx.store.openCursor();

        while (gcursor) {
          gcursor.value.channels = [];
          await gcursor.update(gcursor.value);
          gcursor = await gcursor.continue();
        }

        const channelsGetTx = DB.userDB!.transaction("Channels", "readonly");

        const channels = await channelsGetTx.store.getAll();

        const syncChannels: Array<TChannel> = await Promise.all(
          followList.map(async (_channel) => {
            const findChannel = channels!.find(
              (_ch) => _ch.broadcaster_id === _channel.broadcaster_id
            );

            const tx = DB.userDB!.transaction("Groups", "readwrite");

            if (findChannel === undefined) {
              const etcGroup = await tx.store.get("etc");

              etcGroup!.channels.push(_channel.broadcaster_id);
              tx.store.put(etcGroup!, "etc");

              return {
                broadcaster_id: _channel.broadcaster_id,
                broadcaster_login: _channel.broadcaster_login,
                broadcaster_name: _channel.broadcaster_name,
                followed_at: _channel.followed_at,
                group_id: "etc",
              } as TChannel;
            }

            const group = await tx.store.get(findChannel.group_id);
            group!.channels.push(findChannel.broadcaster_id);
            await tx.store.put(group!, group!.name);

            return findChannel;
          })
        );

        const removeTx = DB.userDB!.transaction("Channels", "readwrite");
        await removeTx.store.clear();

        await Promise.all(
          syncChannels.map((_channel) => {
            const tx = DB.userDB!.transaction("Channels", "readwrite");

            tx.store.add(_channel, _channel.broadcaster_id);
          })
        );

        const gtx = DB.userDB!.transaction("Groups", "readonly");
        const syncGroups = await gtx.store.getAll();


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
          .catch(() => {
            stream_list: [];
          });

        const completeMessage: WebMessageForm<WorkerPostEvents> = {
          origin: "worker",
          type: "result-sync-twitch-followed-list",
          data: {
            syncChannels,
            syncGroups,
            syncStreams: stream_list
          }
        };

        sendToMainThread(completeMessage);
      }
    });
  }
}

export class ViewGroupHandler extends ViewHandler {
  listener(): void {
    addSelfListener(async (e) => {
      const eventType = e.data.type as GroupPostEvents;

      if (eventType === "remove-channel-from-grpup") {
        const { channel, group } = e.data.data;
        group.channels = group.channels.filter(
          (_channelId: BroadcasterId) => channel.broadcaster_id !== _channelId
        );

        const tx = DB.userDB!.transaction("Groups", "readwrite");

        tx.store.put(group, group.name);

        const etcGroup = await tx.store.get("etc");
        etcGroup!.channels.push(channel.broadcaster_id);

        tx.store.put(etcGroup!, "etc");

        const ctx = DB.userDB!.transaction("Channels", "readwrite");
        channel.group_id = "etc";
        ctx.store.put(channel, channel.broadcaster_id);

        const message: WebMessageForm<WorkerPostEvents> = {
          type: "result-remove-channel-from-group",
          origin: "worker",
          data: {
            channel,
            group,
          },
        };
        sendToMainThread(message);
      }
    });
  }
}

export class ViewAddChannelsHandler extends ViewHandler {
  listener(): void {
    addSelfListener(async (e) => {
      const eventType = e.data.type as AddChannelsPostEvents;

      if (eventType === "change-channels-group") {
        const { channels, groupId } = e.data.data;

        await Promise.all(
          channels.map(async (channel: TChannel) => {
            const gtx = DB.userDB!.transaction("Groups", "readwrite");

            const group = await gtx.store.get(channel.group_id);
            group!.channels = group!.channels.filter(
              (_id) => _id !== channel.broadcaster_id
            );

            await gtx.store.put(group!, group!.name);

            return gtx.done;
          })
        );

        await Promise.all(
          channels.map(async (channel: TChannel) => {
            const ctx = DB.userDB!.transaction("Channels", "readwrite");

            channel!.group_id = groupId;

            await ctx.store.put(channel!, channel.broadcaster_id);

            return ctx.done;
          })
        );

        const gtx = DB.userDB!.transaction("Groups", "readwrite");
        const nextGroup = await gtx.store.get(groupId);
        channels.forEach((_channel: TChannel) =>
          nextGroup!.channels.push(_channel.broadcaster_id)
        );

        await gtx.store.put(nextGroup!, nextGroup!.name);

        const allGroups = await gtx.store.getAll();
        const ctx = DB.userDB!.transaction("Channels", "readwrite");
        const allChannels = await ctx.store.getAll();

        const message: WebMessageForm<WorkerPostEvents> = {
          origin: "worker",
          type: "result-change-channels-group",
          data: {
            groups: allGroups,
            channels: allChannels,
          },
        };

        sendToMainThread(message);
      }
    });
  }
}
