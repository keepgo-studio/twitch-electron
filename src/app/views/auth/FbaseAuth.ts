import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";


/**
 * auth button 하나 만들기
 * 
 * 클릭하면 다 view clear해서 3dot loading만 보여주기,
 * 
 * 만약 connection이 web과 끊기면 다시 auth 버튼 보여줌
 */
@customElement("view-fbase-auth")
class FbaseAuthView extends LitElement {
  constructor() {
    super();
  }

  twitchAuthCall() {
    window.api.openBrowser("https://twitch-group.firebaseapp.com");
    // window.api.openBrowser("http://localhost:5002");
  }

  render() {
    return html`
      <div>
        <button @click=${this.twitchAuthCall}>sign in</button>
      </div>
    `;
  }
}
