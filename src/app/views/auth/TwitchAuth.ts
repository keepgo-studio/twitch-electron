import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Interpreter, State } from "xstate";
import { addWorkerListener, removeWorkerListener, sendToWorker } from "@utils/message";

import type { AuthPostEvents, WorkerPostEvents } from "@utils/events";
import { FbaseAuthEvents } from "@state/App.state";
/**
 * auth button 하나 만들기
 *
 * 클릭하면 다 view clear해서 3dot loading만 보여주기,
 *
 * 만약 connection이 web과 끊기면 다시 auth 버튼 보여줌
 */
@customElement("view-twitch-auth")
class TwitchAuthView extends LitElement {
  private _subscribed = false;
  private _userInfo: TUserInfo;

  @property()
  username: string

  @property({ type: Object })
  authService?: Interpreter<any, any, FbaseAuthEvents>;

  @state()
  _state: State<any>;

  @state()
  _name: string = "";

  // @state()
  // ping = 0

  authWorkerListener(e: MessageEvent<WebMessageForm<WorkerPostEvents>>) {
    if (e.data.type === "after-open-user-db") {
      setTimeout(() => this.authService?.send({
        type: "complete auth",
        userInfo: this._userInfo
      }), 2000);
    }
  }

  constructor() {
    super();
    
    addWorkerListener(this.authWorkerListener.bind(this));

    window.api.addTwitchAuthLitsener((oidc) => {
      this._userInfo = {
        AOT: true,
        mode: "player",
        access_token: oidc.access_token,
        current_user_id: oidc.current_user_id,
        username: oidc.username
      }

      this._name = this._userInfo.username!;

      const messageOpenDB: WebMessageForm<AuthPostEvents> = {
        origin: "viwe-auth",
        type: "open-user-db-to-worker",
        data: this._name
      }
      sendToWorker(messageOpenDB);
    })
  }

  // private _stid?: ReturnType<typeof setTimeout>;
  // handleConnection() {
  //   if (this._stid) {
  //     clearTimeout(this._stid);
  //     this._stid = undefined;
  //   }

  //   // TODO: hide button

  //   this._stid = setTimeout(() => {
  //     // TODO: show button
  //   }, window.pingTime);
  // }

  disconnectedCallback(): void {
    removeWorkerListener(this.authWorkerListener);
  }

  btnClickHandler() {
    this.authService!.send("redirect authorization");
  }

  render() {
    if (!this.authService) return;

    if (!this._subscribed) {
      this.authService.subscribe(s => this._state = s);
    }

    return html`
      <div>
        <p>
          Logging in with ${this.username}
        </p>
        ${this._name !== ""
          ? html`<div>${this._name}</div>`
          : ""}
        ${this._state.matches("idle") && this._name == ""
          ? html`<button @click=${this.btnClickHandler}>fbase</button>`
          : ""}
      </div>
    `;
  }
}
