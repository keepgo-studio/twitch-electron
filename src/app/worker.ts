import { DBSchema, openDB } from "idb";

const IDB_NAME = "TwitchPlayer";

type BroadcasterId = number;

interface PlayerIDB extends DBSchema {
  'UserInfo': {
    key: "root";
    value: UserInfo & {
      mode: "detach" | "remote" | "player";
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

      const groupsStore = _db.createObjectStore("Groups");

      const channelsStore = _db.createObjectStore("Channels");
    }
  });

  onmessage = (e) => {
    switch(e.data.type) {
      case "getAccessToken":

        break;
    }
  }
}

console.log("web worker on");

main();