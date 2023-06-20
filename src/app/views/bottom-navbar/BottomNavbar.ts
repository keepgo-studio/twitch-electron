import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

@customElement("view-bottom-navbar")
class BottomNavbar extends LitElement {

  static styles = css`
    li {
      cursor: pointer;
    }  
  `;

  @property({ type: Object })
  userInfo?: TUserInfo

  fireEvent(e: MouseEvent) {
    const target = e.currentTarget as Element;
    const eventType = target.className;

    this.dispatchEvent(new CustomEvent(eventType));
  }

  // ["alwaysOnTop", "editGroupName", "home", "playerMode", "setting"]

  render() {
    return html`
      <nav>
        <div>
          <ul>
            <li class="aot" @click=${this.fireEvent}><i>${this.userInfo?.AOT}</i></li>
            <li class="changeGroupeName" @click=${this.fireEvent}><i>Change Group Name</i></li>
            <li class="goHome" @click=${this.fireEvent}><i>go Home</i></li>
            <li class="changeMode" @click=${this.fireEvent}><i>Change Mode</i></li>
            <li class="openSetting" @click=${this.fireEvent}><i>Open Setting</i></li>
          </ul>
        </div>
      </nav>
    `;
  }
}