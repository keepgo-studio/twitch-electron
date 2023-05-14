import { LitElement, html, css, PropertyValueMap } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { AppMachine } from "state/App.state";
import { interpret, sendTo } from "xstate";

import "@views/skeleton/Skeleton";
import "@views/main/Main";
import "@views/auth/TwitchAuth";

import type { WorkerHandlingEvents } from "worker";

type AppHandlingEvnets = "user-update" | "access-token-valid" | "update connection" | "return userInfo from web";
export type {
  AppHandlingEvnets
}

export const AppTag = "view-app";

@customElement("view-app")
class MainView extends LitElement {

  static styles = css`
    view-skeleton,
    view-main,
    view-twitch-auth {
      display: none;
    }

    .show {
      display: block;
    }
  `

  private _service;
  
  private _userInfo: UserInfo;

  private _ping = 0;

  @state()
  _state;

  @query("view-skeleton")
  ViewSkeleton: Element;
  
  @query("view-main")
  ViewMain: Element;
  
  @query("view-twitch-auth")
  ViewFbaseAuth: Element;

  constructor() {
    super();

    this.addEventListener("user-update", (e: CustomEvent) => {
      this._userInfo = e.detail as UserInfo;

      window.worker.postMessage({
        type: "get-access-token-valid",
        data: this._userInfo.access_token
      } as WebMessageForm<WorkerHandlingEvents>)
    });

    this.addEventListener("access-token-valid", (e: CustomEvent) => {
      const isValid = e.detail as boolean;

      this._service.send({
        type: "token is",
        isValid
      });
    });

    this.addEventListener("update connection", () => {
      this._service.send("connection");
      this._ping++;
    });

    this.addEventListener("return userInfo from web", () => {
      this._service.send("done.fbaseauth.fbaseauth");
    });

    this._service = interpret(AppMachine.withConfig({
      actions: {
        "request userInfo": () => {
          window.worker.postMessage({
            type: "get-user-info",
          } as WebMessageForm<WorkerHandlingEvents>)
        },

        "create skeleton": () => {
          this.ViewSkeleton.classList.add("show");
        },
        "remove skeleton": () => {
          this.ViewSkeleton.classList.remove("show");
        },
        "create fbase auth view": () => {
          this.ViewFbaseAuth.classList.add("show");
        },
        "remove fbase auth view": () => {},
        "send connected": sendTo("fbaseauth", "check connection"),
        "request data": () => {},
        "change skeleton ui": () => {},
        "create ui": () => {
          this.ViewMain.classList.add("show");
        },
      },
      guards: {
        "valid": (_, event) => event.isValid,
        "unvalid": (_, event) => !event.isValid,
      }
    }));

    this._state = this._service.initialState;
  }


  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    this._service
      .onTransition(s => this._state = s)
      .start();

    this._service.send("request checking userInfo to worker");
  }

  protected render() {
    console.log(this._state.value);
    return html`
      <main>
        <view-skeleton></view-skeleton>

        <view-twitch-auth
          .ping=${this._ping}
        ></view-twitch-auth>
        
        <view-main></view-main>

        <view-bottom-navbar></view-bottom-navbar>
      </main>
    `;
  }
}