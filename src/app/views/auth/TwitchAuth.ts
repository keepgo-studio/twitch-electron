import { LitElement, PropertyValueMap, html, unsafeCSS } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { Interpreter, State } from "xstate";
import { addWorkerListener, removeWorkerListener, sendToWorker } from "@utils/message";
import { FbaseAuthEvents } from "@state/App.state";

import type { AuthPostEvents, WorkerPostEvents } from "@utils/events";

import styles from "./TwitchAuth.scss";
import { Expo, gsap } from "gsap";

@customElement("view-twitch-auth")
class TwitchAuthView extends LitElement {
  static styles = unsafeCSS(styles);

  private _subscribed = false;
  private _userInfo: TUserInfo;

  @property({ type: Object })
  profile: TProfile

  @property({ type: Object })
  authService?: Interpreter<any, any, FbaseAuthEvents>;

  @state()
  _state: State<any>;

  @state()
  _name: string = "";

  @query(".text-container")
  textElem: Element;

  @query(".profile-container")
  profileElem: Element;

  @query(".after-login")
  afterElem: Element;

  authWorkerListener(e: MessageEvent<WebMessageForm<WorkerPostEvents>>) {
    if (e.data.type === "after-open-user-db") {
      const animation = () => {
        gsap.timeline()
        .to(this.textElem, {
          y: 10,
          opacity: 0,
          ease: Expo.easeOut,
          duration: 1,
          delay: 0.5,
        })
        .to(this.profileElem, {
          y: 10,
          opacity: 0,
          ease: Expo.easeOut,
          duration: 1,
        }, "-=0.7")
        .set(this.afterElem, {
          zIndex: 1,
        })
        .from(this.afterElem.querySelector("h3"), {
          opacity: 0,
          ease: Expo.easeOut,
          duration: 1,
        })
        .from(this.afterElem.querySelector("h1"), {
          opacity: 0,
          ease: Expo.easeOut,
          duration: 1,
        }, "-=0.5")
        .set({}, { 
          delay: 1, onComplete: () => {
            this.authService?.send({
              type: "complete auth",
              userInfo: this._userInfo
            })
          }
        })
      }
      animation();
    }
  }

  constructor() {
    super();
    
    addWorkerListener(this.authWorkerListener.bind(this));

    window.api.addTwitchAuthLitsener((oidc) => {
      this._userInfo = {
        AOT: true,
        access_token: oidc.access_token,
        current_user_id: oidc.current_user_id,
        username: oidc.username
      }

      this._name = this._userInfo.username!;

      const messageOpenDB: WebMessageForm<AuthPostEvents> = {
        origin: "viwe-auth",
        type: "open-user-db-to-worker",
        data: this._userInfo
      }
      sendToWorker(messageOpenDB);
    })
  }

  disconnectedCallback(): void {
    removeWorkerListener(this.authWorkerListener);
  }

  btnClickHandler() {
    this.authService!.send("redirect authorization");
  }

  protected shouldUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): boolean {
    if (!this.authService) return false;

    return true;
  }

  render() {
    if (!this._subscribed) {
      this.authService!.subscribe(s => this._state = s);
  }

    const isAddingNew = this.profile.username === "undefined--adding-new-user";

    const reAuthUserHTML = html`
      <h3>Token expired</h3>

      <div>
        <h2>To <span>give permission </span>for,</h2>
  
        <img src="public/logo.png"/>
      </div>
    `

    const newUserHTML = html`
      <h3>Add new user</h3>

      <img src="public/logo.png"/>
    `

    return html`
      <div id="auth">
        <div class="text-container ${isAddingNew ? "new" : ""}">
          ${isAddingNew ? newUserHTML : reAuthUserHTML}
        </div>

        <div class="profile-container">
          <div class="profile">
            <h3>${isAddingNew ? "" : "Authorization again with"}</h3>
            <h1>${isAddingNew ? "" : this.profile.username}</h1>
          </div>

          <img src="${this.profile.profile_image_url}"/>
          
          <button @click=${this.btnClickHandler}>
            <div class="hover-effect"></div>
            <div class="icon"><img src="public/TwitchGlitchPurple.png"/></div>
            <p>REQUEST AUTH</p>
          </button>
        </div>

        <div class="after-login">
          <h3>Hello,</h3>
          <h1>${this._name}</h1>
        </div>
      </div>

    `;
  }
}
