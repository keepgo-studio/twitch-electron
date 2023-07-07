declare global {
  type TSVGModule = string;

  interface PreloadAPI { 
    openBrowser: (url: string) => {};

    openPlayer: (channel: TChannel) => {};

    onFollowEventListener: (callback:(type: "FollowButton_FollowUser" | "FollowButton_UnfollowUser", targetId: BroadcasterId) => void) => void;

    addTwitchAuthLitsener: (callback: (userInfo: TwitchOIDCFromFirebase) => void) => void;

    updateWorking: (working: boolean) => {};

    syncAot: (aot: boolean) => Promise<boolean>;
  }

  interface TwitchOIDCFromFirebase {
    username: string,
    current_user_id: string,
    access_token: string,
  }
  interface Window { 
    api: PreloadAPI;
    worker: Worker;
    pingTime: number;
  }

  type BroadcasterId = string;
  type GroupId = string;

  interface TProfile {
    username: string;
    profile_image_url: string;
    offline_image_url: string;
  }

  interface TUserInfo {
    username: string | undefined;
    current_user_id: string | undefined;
    access_token: string | undefined;
    AOT: boolean;
  }

  interface TGroup {
    name: GroupId;
    channels: Array<BroadcasterId>;
    color: string;
    created_at: string;
  }

  interface TChannel {
    broadcaster_id: BroadcasterId,
    broadcaster_name: string;
    broadcaster_login: string;
    followed_at: string;
    group_id: GroupId,
    profile_image_url: string;
  }

  interface TStream {
    user_id: string,
    user_login: string,
    game_name: string,
    started_at: string,
    thumbnail_url: string,
    title: string,
    viewer_count: number
  }

  type MessageOrigins =  
    | "worker" 
    | "view-app" 
    | "view-profile" 
    | "viwe-auth" 
    | "view-group" 
    | "view-main"
    | "view-add-channels";

  interface WebMessageForm<T> {
    origin: MessageOrigins,
    type: T,
    data?: any
  }

  type PlayerMode = "player" | "detach";

  interface PlayerLangMap {
    twitchAuth: {
      reAuth: {
        h3Token: string,
        h3Profile: string
  
      },
      newAuth: {
        h3Auth: string
      },
      requestBtn: string
    },
    main: {
      all: string,
      etc: string,
      alertAddNewGroup: {
        header: string,
        body: string
      },
      alertChangeGroupName: {
        header: string,
        body: string
      },
      alertAllEtcChangeGroupName: {
        all: {
          header: string,
          body: string
        },
        etc: {
          header: string,
          body: string
        }
      },
      alertAllChangeColor: {
        header: string,
        body: string
      },
      conformRemoveGroup: {
        header: string 
        body: string
      },
      promptAddNewGroup: {
        header: string,
        body: string
      },
      promptChangeGroupName: {
        header: string,
        body: string
      }
    },
    dialog: {
      confirm: {
        cancel: string,
        confirm: string
      },
      prompt: {
        cancel: string,
        confirm: string  
      },
      alert: {
        confirm: string
      },
      colorPicker: {
        h1: string,
        p: string,
        cancel: string,
        confirm: string 
      },
      addChannels: {
        h3: string,
        cancel: string,
        confirm: string 
      }
    }
  }
}

export {}