import { LitElement, html, css, PropertyValueMap, unsafeCSS } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { Interpreter, interpret, sendTo } from "xstate";
import { APP_CHILD_ID, AppMachine, FbaseAuthEvents } from "@state/App.state";
import { addWorkerListener, removeWorkerListener, sendToWorker } from "@utils/message";
import { Expo, gsap } from "gsap";

import "@views/profile/Profile";
import "@views/skeleton/Skeleton";
import "@views/main/Main";
import "@views/auth/TwitchAuth";

import type { AppPostEvents, WorkerPostEvents } from "@utils/events";

import styles from "./App.scss";

export const AppTag = "view-app";


const createAnimation = (elem: Element) => {
  elem.classList.add("show");

  gsap.timeline()
    .set(elem, {
      display: "block"
    })
    .to(elem, {
      ease: Expo.easeOut,
      opacity: 1,
      duration: 1,
      delay: 1,
      onComplete: () => {
        elem.dispatchEvent(new CustomEvent("show-page"))
      }
    });
}
const removeAnimation = (elem: Element, type: "scroll" | "fadeOut") => {
  if (type === "scroll") {
    gsap.timeline()
      .to(elem, {
        x: "100vw",
        ease: Expo.easeOut,
        duration: 1,
        delay: 0.5,
        onComplete:() => elem.classList.remove("show")
      })
      .set(elem, {
        display: "none"
      });
  }
  else if (type === "fadeOut") {
    gsap.timeline()
      .to(elem, {
        ease: Expo.easeOut,
        duration: 1,
        delay: 0.5,
        onComplete:() => elem.classList.remove("show")
      })
      .set(elem, {
        display: "none"
      });
  }
}

@customElement("view-app")
class MainView extends LitElement {
  static styles = unsafeCSS(styles);

  private _service;

  @state()
  _state;
  @state()
  _choosedProfile: TProfile
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
  ViewProfile: HTMLElement;

  @query("view-skeleton")
  ViewSkeleton: HTMLElement;

  @query("view-main")
  ViewMain: HTMLElement;

  @query("view-twitch-auth")
  ViewTwitchAuth: HTMLElement;

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

    addWorkerListener(this.appWorkerListener.bind(this));

    const skeletonRemover = () => {
      this.ViewSkeleton.classList.remove("show");
      this.ViewSkeleton.style.display = "none"
    }

    this._service = interpret(
      AppMachine.withConfig({
        actions: {
          "create profile view": () => {
            createAnimation(this.ViewProfile);
          },
          "remove profile view": () => {
            removeAnimation(this.ViewProfile, "scroll");
            this.ViewProfile.setAttribute("loading", "false");
          },
          "get choosed user info from worker": (_, event) => {
            /**
             * 1. add new user->it will return undefined
             * 2. any profiles are stored in app
             */
            if (event.profile === undefined) {
              this._choosedProfile = {
                offline_image_url: "",
                profile_image_url: "public/account_circle.png",
                username: "undefined--adding-new-user"
              };

              this._service.send({
                type: "token is",
                isValid: false
              })
            }
            else {
              this._choosedProfile = { ...event.profile };
              
              const message: WebMessageForm<AppPostEvents> = {
                type: "get-userinfo-by-name",
                origin: "view-app",
                data: event.profile.username
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
            createAnimation(this.ViewSkeleton);
          },
          "remove skeleton": () => {
            removeAnimation(this.ViewSkeleton, "fadeOut");
          },
          "create fbase auth view": () => {
            createAnimation(this.ViewTwitchAuth);
          },
          "remove fbase auth view": () => {
            removeAnimation(this.ViewTwitchAuth, "scroll")
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
            createAnimation(this.ViewMain);
          },
          "remove ui": () => {
            removeAnimation(this.ViewMain, "scroll");
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
          .profile=${this._choosedProfile}
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
