import { LitElement, html, css, PropertyValueMap } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { APP_CHILD_ID, AppMachine } from "state/App.state";
import { interpret, sendTo } from "xstate";

import "@views/skeleton/Skeleton";
import "@views/main/Main";
import "@views/auth/TwitchAuth";

import type { WorkerHandlingEvents } from "worker";

type AppHandlingEvnets =
  | "user-update"
  | "access-token-valid"
  | "return user-info from web"
  | "followed-channel-data";
export type { AppHandlingEvnets };

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
  `;

  private _service;

  private _userInfo: UserInfo;

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

    this.addEventListener(
      "user-update" as AppHandlingEvnets,
      (e: CustomEvent) => {
        this._userInfo = e.detail as UserInfo;

        window.worker.postMessage({
          type: "get-access-token-valid",
          data: this._userInfo.access_token,
        } as WebMessageForm<WorkerHandlingEvents>);
      }
    );

    this.addEventListener(
      "access-token-valid" as AppHandlingEvnets,
      (e: CustomEvent) => {
        const isValid = e.detail as boolean;

        this._service.send({
          type: "token is",
          isValid,
        });
      }
    );

    this.addEventListener(
      "return user-info from web" as AppHandlingEvnets,
      (e: CustomEvent) => {
        const name = e.detail;

        this.ViewFbaseAuth.dispatchEvent(
          new CustomEvent("user-info", {
            detail: name,
          })
        );
      }
    );

    this.addEventListener(
      "followed-channel-data" as AppHandlingEvnets,
      (e: CustomEvent) => {
        console.log("[App]: I've got data", e.detail);
      }
    );

    this._service = interpret(
      AppMachine.withConfig({
        actions: {
          "request userInfo": () => {
            window.worker.postMessage({
              type: "get-user-info",
            } as WebMessageForm<WorkerHandlingEvents>);
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
          "remove fbase auth view": () => {
            this.ViewFbaseAuth.classList.remove("show");
          },
          "send connected": sendTo(APP_CHILD_ID, "check connection"),
          "request data": () => {
            window.worker.postMessage({
              type: "get-followed-channels",
            } as WebMessageForm<WorkerHandlingEvents>);
          },
          "change skeleton ui": () => {},
          "create ui": () => {
            this.ViewMain.classList.add("show");
          },
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

    this._service.send("request checking userInfo to worker");
  }

  protected render() {
    console.log("[App]:", this._state.value);
    return html`
      <main>
        <view-skeleton></view-skeleton>

        <view-twitch-auth
          .authService=${this._state.children
            ? this._state.children[APP_CHILD_ID]
            : undefined}
        ></view-twitch-auth>

        <view-main></view-main>

        <view-bottom-navbar></view-bottom-navbar>
      </main>
    `;
  }
}
