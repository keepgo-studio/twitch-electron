import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

type BottomNavbarEvents =
  | "toggle AOT"
  | "change group name"
  | "go home"
  | "change mode"
  | "open setting"

type BottomNavbarDataType = {
  aot: Boolean
  currentGroupId: number,
  mode: PlayerMode,
};

export type { 
  BottomNavbarEvents,
  BottomNavbarDataType
};

@customElement("view-bottom-navbar")
class BottomNavbar extends LitElement {

  static styles = css`
    li {
      cursor: pointer;
    }  
  `;

  @property()
  data: BottomNavbarDataType

  @query("item-AOT")
  ElemeAOT: Element;

  @query("component-form")
  ComponentForm: Element;

  requestAOT() {
    this.parentElement?.dispatchEvent(new CustomEvent("bottom-nav-bar", {
      detail: {
        type: "toggle AOT",
      }
    }));
  }

  changeGroupName() {
    this.parentElement?.dispatchEvent(new CustomEvent("bottom-nav-bar", {
      detail: {
        type: "change group name",
      }
    }));
  }

  goHome() {
    this.parentElement?.dispatchEvent(new CustomEvent("bottom-nav-bar", {
      detail: {
        type: "go home"
      }
    }));
  }
  
  changeMode() {
    this.parentElement?.dispatchEvent(new CustomEvent("bottom-nav-bar", {
      detail: {
        type: "change mode"
      }
    }));
  }

  openSetting() {
    this.parentElement?.dispatchEvent(new CustomEvent("bottom-nav-bar", {
      detail: {
        type: "open setting"
      }
    }));
  }

  // ["alwaysOnTop", "editGroupName", "home", "playerMode", "setting"]

  render() {
    return html`
      <component-form></component-form>
      <nav>
        <div>
          <ul>
            <li @click=${this.requestAOT}><i>${this.data.aot}</i></li>
            <li @click=${this.changeGroupName}><i>Change Group Name</i></li>
            <li @click=${this.goHome}><i>go Home</i></li>
            <li @click=${this.changeMode}><i>Change Mode</i></li>
            <li @click=${this.openSetting}><i>Open Setting</i></li>
          </ul>
        </div>
      </nav>
    `;
  }
}