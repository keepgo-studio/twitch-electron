import { LitElement, html, css, PropertyValueMap } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { Interpreter, interpret, sendTo } from "xstate";
import { APP_CHILD_ID, AppMachine, FbaseAuthEvents } from "@state/App.state";
import { addWorkerListener, removeWorkerListener, sendToWorker } from "@utils/message";

import "@views/profile/Profile";
import "@views/skeleton/Skeleton";
import "@views/main/Main";
import "@views/auth/TwitchAuth";

import type { AppPostEvents, WorkerPostEvents } from "@utils/events";

export const AppTag = "view-app";

@customElement("view-app")
class MainView extends LitElement {
  static styles = css`
    main * {
      display: none;
    }

    main .show {
      display: block;
    }
  `;

  private _service;

  @state()
  _state;
  @state()
  _choosedUsername: string
  @state()
  _userInfo?: TUserInfo;
  @state()
  _currentGroupId: GroupId
  @state()
  _followList?: Array<TChannel>
  @state()
  _groupList?: Array<TGroup>
  @state()
  _streamList?: Array<TStream>
  
  @query("view-profile")
  ViewProfile: Element;

  @query("view-skeleton")
  ViewSkeleton: Element;

  @query("view-main")
  ViewMain: Element;

  @query("view-twitch-auth")
  ViewTwitchAuth: Element;

  appWorkerListener(e: MessageEvent<WebMessageForm<WorkerPostEvents>>) {
    if (e.data.type === "return-userinfo") {
      this._userInfo = { ...e.data.data };

      const message: WebMessageForm<AppPostEvents> = {
        origin: "view-app",
        type: "check-access-token-valid",
        data: this._userInfo?.access_token
      }

      sendToWorker(message);
    }
    else if (e.data.type === "result-token-validation") {
      const isValid = e.data.data;

      this._service.send({
        type: "token is",
        isValid
      })
    }
    else if (e.data.type === "sync-complete-followed-list") {
      this._service.send("first complete");
    }
    else if (e.data.type === "return-followed-list") {
      this._followList = e.data.data;
    }
    else if (e.data.type === "return-group-list") {
      this._groupList = e.data.data;
    }
    else if (e.data.type === "return-stream-channels") {
      this._streamList = e.data.data;
    }
  }

  constructor() {
    super();

    window.api.onFollowEventListener((type, targetId) => {
      console.log("App", type, targetId);
    })

    addWorkerListener(this.appWorkerListener.bind(this));

    this._service = interpret(
      AppMachine.withConfig({
        actions: {
          "create profile view": () => {
            this.ViewProfile.classList.add("show");
          },
          "remove profile view": () => {
            this.ViewProfile.classList.remove("show");
          },
          "get choosed user info from worker": (_, event) => {
            /**
             * if 
             * 1. any profiles are stored in app
             * 2. add new user
             * then it will return undefined
             */
            if (event.name === undefined) {
              this._service.send({
                type: "token is",
                isValid: false
              })
            }
            else {
              this._choosedUsername = event.name;
              
              const message: WebMessageForm<AppPostEvents> = {
                type: "get-userinfo-by-name",
                origin: "view-app",
                data: event.name
              };

              sendToWorker(message);
            }
          },
          "get user info from auth": (_, event) => {
            // event from auth machine, check TwitchAuth.ts
            this._userInfo?.AOT
            this._userInfo = event.data.userInfo;

            const message: WebMessageForm<AppPostEvents> = {
              origin: "viwe-auth",
              type: "sync-userinfo",
              data: this._userInfo
            }
      
            sendToWorker(message);
          },
          "create skeleton": () => {
            this.ViewSkeleton.classList.add("show");
          },
          "remove skeleton": () => {
            this.ViewSkeleton.classList.remove("show");
          },
          "create fbase auth view": () => {
            this.ViewTwitchAuth.classList.add("show");
          },
          "remove fbase auth view": () => {
            this.ViewTwitchAuth.classList.remove("show");
          },
          "send connected": sendTo(APP_CHILD_ID, "check connection"),
          "sync followed list": () => {
            const message: WebMessageForm<AppPostEvents> = {
              origin: "view-app",
              type: "sync-followed-list",
              data: this._userInfo
            };
            
            sendToWorker(message);
          },
          "create ui": () => {
            this.ViewMain.classList.add("show");
          },
          "get saved data": () => {
            const messageChannel: WebMessageForm<AppPostEvents> = {
              origin: "view-app",
              type: "get-followed-list"
            }
            const messageStream: WebMessageForm<AppPostEvents> = {
              origin: "view-app",
              type: "get-stream-list",
              data: this._userInfo
            }
            const messageGroup: WebMessageForm<AppPostEvents> = {
              origin: "view-app",
              type: "get-group-list"
            }

            sendToWorker(messageChannel);
            sendToWorker(messageStream);
            sendToWorker(messageGroup);
          }
        },
        guards: {
          valid: (_, event) => event.isValid,
          unvalid: (_, event) => !event.isValid,
        },
      })
    );

    this._state = this._service.initialState;
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    this._service.onTransition((s) => (this._state = s)).start();
  }

  disconnectedCallback(): void {
      removeWorkerListener(this.appWorkerListener);
  }

  protected render() {
    return html`
      <main>
        <view-profile
          .appService=${this._service}
        ></view-profile>

        <view-skeleton></view-skeleton>

        <view-twitch-auth
          .authService=${this._state.children
            ? this._state.children[APP_CHILD_ID] as Interpreter<any, any, FbaseAuthEvents>
            : undefined}
          .username=${this._choosedUsername}
        ></view-twitch-auth>

        <view-main
          .followList=${this._followList}
          .groupList=${this._groupList}
          .streamList=${this._streamList}
          .userInfo=${this._userInfo}
        ></view-main>
      </main>
    `;
  }
}
