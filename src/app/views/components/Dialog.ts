import { ViewCore } from '@utils/core';
import { PropertyValueMap, html, unsafeCSS } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { getLangJson } from '@utils/functions';

import styles from "./Dialog.scss";

export abstract class DialogCore extends ViewCore {
  static styles = unsafeCSS(styles);

  public langJson: PlayerLangMap;

  constructor() {
    super();
    
    this.langJson = getLangJson();
  }

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

@customElement('component-confirm')
export class Confirm extends DialogCore {
  @state()
  _header = "";

  @state()
  _confirmMsg = '';

  @state()
  _isConfirmed: boolean;

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

  constructor(header:string, confirmMsg: string) {
    super();
    this._header = header;
    this._confirmMsg = confirmMsg;
  }

  render() {
    return html`
      <div class="dialog">
        <div class="container">
            <h1>${this._header}</h1>
            <p>${this._confirmMsg}</p>
            
            <div class="btn-container">
                <button @click=${this.handleSubmit} class="cancel">
                ${this.langJson.dialog.confirm.cancel}
                </button>
                <button @click=${this.handleSubmit} class="confirm">
                ${this.langJson.dialog.confirm.confirm}
                </button>
            </div>
        </div>
      </div>
    `;
  }
}

@customElement('component-prompt')
export class Prompt extends DialogCore {
  @state()
  _header = '';

  @state()
  _promptMsg = '';

  @state()
  _inputText? = '';

  @state()
  _errorMessage = '';

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
      this._inputText = undefined;
    }

    if (this._inputText === '') {
      this._errorMessage = "you cannot confirm empty string";
    }
    else {
      this._closeDialog = true;
    }
  }

  constructor(header:string, promptMsg: string) {
    super();

    this._header = header;
    this._promptMsg = promptMsg;
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
      <div class="dialog">
        <div class="container">
            <h1>${this._header}</h1>
            <p>${this._promptMsg}</p>

            <input type="text" id="text-input" autofocus />

            ${this._errorMessage && html`<h3 class="error">${this._errorMessage}</h3>`}
            
            <div class="btn-container">
                <button @click=${this.handleSubmit} class="cancel">
                ${this.langJson.dialog.prompt.cancel}
                </button>
                <button @click=${this.handleSubmit} class="confirm">
                ${this.langJson.dialog.prompt.confirm}
                </button>
            </div>
        </div>
      </div>
    `;
  }
}

@customElement('component-alert')
export class Alert extends DialogCore {
  @state()
  _header = "";
  @state()
  _alertMsg = '';

  @query('#dialog')
  dialog:Element | undefined;

  public returnValue() {
    return true;
  }

  private handleSubmit(e: Event) {
    this._closeDialog = true;
  }

  constructor(header:string, alertMsg: string) {
    super();

    this._header = header;
    this._alertMsg = alertMsg;
  }

  render() {
    return html`
      <div class="dialog">
        <div class="container">
            <h1>${this._header}</h1>
            <p>${this._alertMsg}</p>
            
            <div class="btn-container">
                <button @click=${this.handleSubmit} class="alert-confirm">
                ${this.langJson.dialog.alert.confirm}
                </button>
            </div>
        </div>
      </div>
    `;
  }
}
