import { DBSchema, IDBPDatabase, openDB } from "idb";

const IDB_NAME = "TwitchPlayer";

interface ProfileIDB extends DBSchema {
  Profiles: {
    key: string,
    value: TProfile
  }
}

interface PlayerIDB extends DBSchema {
  UserInfo: {
    key: "root";
    value: TUserInfo;
  };

  Groups: {
    key: GroupId;
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

export default class DB {
  static profileDB?: IDBPDatabase<ProfileIDB>;

  static userDB?: IDBPDatabase<PlayerIDB>;

  static async openProfileDB() {
    this.profileDB = await openDB<ProfileIDB>(IDB_NAME, 1, {
      upgrade(_db) {
        _db.createObjectStore("Profiles");
      }
    });
  }

  static async openUserDB(userName?: string) {
    this.userDB = await openDB<PlayerIDB>(`${userName}-${IDB_NAME}`, 1, {
      upgrade(_db) {
        const userStore = _db.createObjectStore("UserInfo");
        userStore.add(
          {
            access_token: undefined,
            current_user_id: undefined,
            username: undefined,
            AOT: true
          },
          "root"
        );
  
        const groupsStore = _db.createObjectStore("Groups");
  
        groupsStore.add(
          {
            name: "etc",
            channels: [],
            color: "#9146FF",
            created_at: new Date().getTime().toString(),
          },
          "etc");

        const channelsStore = _db.createObjectStore("Channels");
      },
    });
  }
}