declare global {
  type TSVGModule = string;

  interface PreloadAPI { 
    openBrowser: (url: string) => {};

    addTwitchAuthLitsener: (callback: (userInfo: TUserInfo) => void) => void;

    updateWorking: (working: boolean) => {};

    toggleAlwaysOnTop: () => Promise<boolean>;
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
  }

  interface TUserInfo {
    username: string | undefined;
    current_user_id: string | undefined;
    access_token: string | undefined;
    AOT: boolean;
    mode: "detach" | "player";
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
  }

  interface TStream {
    id: string,
    user_id: string,
    user_login: string,
    game_name: string,
    started_at: string,
    thumbnail_url: string,
    title: string,
    viewer_count: number
  }

  type MessageOrigins =  "worker" | "view-app" | "view-profile" | "viwe-auth" | "view-group";

  interface WebMessageForm<T> {
    origin: MessageOrigins,
    type: T,
    data?: any
  }

  type PlayerMode = "player" | "detach";
}

export {}