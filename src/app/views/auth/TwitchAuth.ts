import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";

/**
 * auth button 하나 만들기
 * 
 * 클릭하면 다 view clear해서 3dot loading만 보여주기,
 * 
 * 만약 connection이 web과 끊기면 다시 auth 버튼 보여줌
 */
@customElement("view-twitch-auth")
class TwitchAuthView extends LitElement {
  @state()
  ping = 0

  constructor() {
    super();
  }

  private _stid?: ReturnType<typeof setTimeout>;

  handleConnection() {
    if (this._stid) {
      clearTimeout(this._stid);
      this._stid = undefined;
    }
    
    // TODO: hide button

    this._stid = setTimeout(() => {
      // TODO: show button
    }, window.pingTime);
  }

  twitchAuthCall() {
    // window.api.openBrowser("https://twitch-group.firebaseapp.com");
    window.api.openBrowser("http://localhost:5002");

    this.handleConnection()
  }

  render() {
    console.log("from Twitch auth", this.ping);
    return html`
      <div>
        <button @click=${this.twitchAuthCall}>sign in</button>
      </div>
    `;
  }
}
