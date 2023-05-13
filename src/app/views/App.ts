import { LitElement, html, css, PropertyValueMap } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { AppMachine } from "state/App.state";
import { interpret } from "xstate";

import "@views/skeleton/Skeleton";
import "@views/main/Main";
import "@views/auth/FbaseAuth";

export const AppTag = "view-app";

@customElement("view-app")
class MainView extends LitElement {

  static styles = css`
    view-skeleton,
    view-main,
    view-fbase-auth {
      display: none;
    }

    .show {
      display: block;
    }
  `

  private _service;
  
  @state()
  _state;

  @query("view-skeleton")
  ViewSkeleton: Element;
  
  @query("view-main")
  ViewMain: Element;
  
  @query("view-fbase-auth")
  ViewFbaseAuth: Element;

  constructor() {
    super();

    this._service = interpret(AppMachine.withConfig({
      actions: {
        "create skeleton": () => {
          this.ViewSkeleton.classList.add("show");
        },
        "remove skeleton": () => {
          this.ViewSkeleton.classList.remove("show");
        },
        "create fbase auth view": () => {
        },
        "remove fbase auth view": () => {},
        "send connected": () => {},
        "request data": () => {},
        "change skeleton ui": () => {},
        "create ui": () => {
          this.ViewMain.classList.add("show");
        },
      },
      guards: {
        "valid": (context, event) => true,
        "unvalid": (context, event) => false,
      }
    }));

    this._state = this._service.initialState;
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    this._service
      .onTransition(s => this._state = s)
      .start();
  }

  protected render() {
    return html`
      <main>
        <view-skeleton></view-skeleton>
        
        <view-main></view-main>
        
        <view-fbase-auth></view-fbase-auth>

        <view-bottom-navbar></view-bottom-navbar>
      </main>
    `;
  }
}