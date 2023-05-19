import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Interpreter, State } from "xstate";

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

  @property()
  authService?: Interpreter<any>;

  @state()
  _state: State<any>;

  @state()
  _name: string = "";

  // @state()
  // ping = 0

  constructor() {
    super();

    this.addEventListener("user-info", (e: CustomEvent) => {
      this._name = e.detail;

      setTimeout(() => this.authService?.send("complete auth"), 2000);
    })
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
