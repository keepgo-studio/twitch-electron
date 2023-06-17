import { LitElement, PropertyValueMap, html, unsafeCSS } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';

import styles from "./Dialog.scss";

abstract class DialogCore extends LitElement {
  static styles = unsafeCSS(styles);

	@state()
  _closeDialog?: boolean;

	wait() {
		return new Promise((res, _) => {
			const loop = () => {
				setTimeout(() => {
					if (this._closeDialog !== undefined) {
						return res(this._closeDialog);
					}
					loop();
				}, 100);
			};
			loop();
		});
	}

	appaer() {
    const prev = document.body.querySelector(this.tagName);
    if (prev) prev.remove();
    
    document.body.appendChild(this);
  }

	disappear() {
    this.remove();
  }

  public abstract returnValue(): any;

	async show() {
    this.appaer();

    await this.wait();

    this.disappear();

    return this.returnValue();
  }

}

@customElement('app-confirm')
export class Confirm extends DialogCore {
  @state()
  _confirmMsg = '';

  @state()
  _isConfirmed: boolean;

  @query('#dialog')
  dialog:Element | undefined;

  public returnValue() {
    return this._isConfirmed;    
  }

  private handleSubmit(e: Event) {
    const target = e.currentTarget as Element;

    if (target.className === 'confirm') {
      this._isConfirmed = true;
    } else {
      this._isConfirmed = false;
    }

    this._closeDialog = true;
  }

  constructor(confirmMsg: string = 'alert') {
    super();

    this._confirmMsg = confirmMsg;
  }

  render() {
    return html`
      <div id="confirm">
        <div class="container">
          <h1>${this._confirmMsg}</h1>

          <button @click=${this.handleSubmit} class="confirm">confirm</button>
          <button @click=${this.handleSubmit} class="cancel">cancel</button>
        </div>
      </div>
    `;
  }
}

@customElement('app-prompt')
export class Prompt extends DialogCore {
  @state()
  _promptMsg = '';

  @state()
  _inputText = '';

  @query('#dialog')
  dialog:Element | undefined;

  @query('#text-input')
  input: HTMLInputElement | undefined;

  public returnValue() {
      return this._inputText;
  }

  private handleSubmit(e: Event) {
    const target = e.currentTarget as Element;

    if (target.className === 'confirm') {
      this._inputText = this.input!.value;
    } else {
      this._inputText = '';
    }

    this._closeDialog = true;
  }

  constructor(confirmMsg: string = 'alert') {
    super();

    this._promptMsg = confirmMsg;
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    this.input!.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this._inputText = this.input!.value;
        this._closeDialog = true;
      }
    })    
  }

  render() {
    return html`
      <div id="prompt">
        <div class="container">
          <h1>${this._promptMsg}</h1>

          <input type="text" id="text-input" autofocus />
          
          <div class="button-container">
            <button @click=${this.handleSubmit} class="confirm">Yes</button>
            <button @click=${this.handleSubmit} class="cancel">No</button>
          </div>
        </div>
      </div>
    `;
  }
}