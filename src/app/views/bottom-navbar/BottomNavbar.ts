import { LitElement, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

import type { WorkerHandlingEvents } from "worker";

@customElement("view-bottom-navbar")
class BottomNavbar extends LitElement {
  @property()
  // isHome = true;
  isHome = false;

  @property()
  AOT: boolean;

  @query("item-AOT")
  ElemeAOT: Element;

  @query("component-form")
  ComponentForm: Element;

  constructor() {
    super();

    this.addEventListener("app", (e:CustomEvent) => {
      if (e.detail.type === "group name changed") {
        
      }
      else if (e.detail.type === "home") {

      }
      else if (e.detail.type === "set mode") {

      }
    })
  }

  async requestAOT() {
    const result = await window.api.toggleAlwaysOnTop();

    window.worker.postMessage({
      type: "save-AOT",
      data: result
    } as WebMessageForm<WorkerHandlingEvents>)

    this.AOT = result;
  }

  changeGroupName() {
    if (this.isHome) {
      // TOOD: tell user home cannot modify name
      return;
    }
    // TODO: need UI that get group form which getting name from the user input
    // let changeName = FormMethod.openForm(this);

    // Test code-------------------
    let changeName = "name";
    // ----------------------------

    this.parentElement?.dispatchEvent(new CustomEvent("bottom-nav-bar", {
      detail: {
        type: "change group name",
        name: changeName
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
            <li @click=${this.requestAOT}><i>${this.AOT}</i></li>
            <li @click=${this.changeGroupName}><i></i></li>
            <li @click=${this.goHome}><i></i></li>
            <li @click=${this.changeMode}><i></i></li>
            <li @click=${this.openSetting}><i></i></li>
          </ul>
        </div>
      </nav>
    `;
  }
}