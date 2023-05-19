declare global {
  type TSVGModule = string;

  interface PreloadAPI { 
    openBrowser: (url: string) => {};

    updateUserCallback: (callback: (userInfo: TUserInfo) => void) => void;

    updateWorking: (working: boolean) => {};

    updateUserInfo: () => {};

    toggleAlwaysOnTop: () => Promise<boolean>;
  }

  interface Window { 
    api: PreloadAPI;
    worker: Worker;
    pingTime: number;
  }

  type BroadcasterId = number;

  interface TUserInfo {
    username: string | undefined;
    current_user_id: string | undefined;
    access_token: string | undefined;
  }

  interface TGroup {
    name: string;
    channels: Array<BroadcasterId>;
    color: string;
    created_at: string;
  }

  interface TChannel {
    id: BroadcasterId,
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

  interface WebMessageForm<T> {
    type: T,
    data: any
  }

  type PlayerMode = "player" | "detach";
}

export {}