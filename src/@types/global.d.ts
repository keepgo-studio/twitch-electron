declare global {
  type TSVGModule = string;

  interface PreloadAPI { 
    openBrowser: (url: string) => {};

    updateUser: (callback: (userInfo: UserInfo) => void) => void;
  }

  interface Window { 
    api: PreloadAPI;
    background: Worker;
  }

  interface UserInfo {
    username: string;
    current_user_id: string;
    access_token: string;
  }
}

export {}