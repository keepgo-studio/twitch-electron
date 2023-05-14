declare global {
  type TSVGModule = string;

  interface PreloadAPI { 
    openBrowser: (url: string) => {};

    updatePingTime: (callback: (pingTime: number) => void) => void;

    updateUserCallback: (callback: (userInfo: UserInfo) => void) => void;
    
    updateConnectionCallback: (callback: () => void) => void;
  }

  interface Window { 
    api: PreloadAPI;
    worker: Worker;
    pingTime: number;
  }

  interface UserInfo {
    username: string | undefined;
    current_user_id: string | undefined;
    access_token: string | undefined;
  }

  interface WebMessageForm<T> {
    type: T,
    data: any
  }
}

export {}