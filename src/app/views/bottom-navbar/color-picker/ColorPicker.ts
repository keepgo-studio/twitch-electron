import { DialogCore } from "@views/components/Dialog";
import { customElement, property, state } from "lit/decorators.js";
import { html, unsafeCSS } from "lit";
import { repeat } from "lit/directives/repeat.js";

import styles from "./ColorPicker.scss";

import ColorMap from "@public/colorMap.json";

@customElement("component-color-picker")
export class ColorPicker extends DialogCore {
  static styles = unsafeCSS(styles);

  @state()
  _selectColor?: string;

  constructor(initColor: string) {
    super();
    this._selectColor = initColor;
  }

  public returnValue() {
    return this._selectColor;
  }

  private handleSubmit(e: Event) {
    const target = e.currentTarget as Element;

    if (target.className === 'cancel') {
      this._selectColor = undefined;
    }

    this._closeDialog = true;
  }

  selectColorListener(e: Event) {
    const target = e.currentTarget as Element;
    const colorCode = target.id.split("-")[1];

    this._selectColor = colorCode;
  }
  
  render() {
    const selectColorName = Object.keys(ColorMap).find(_name => ColorMap[_name] === this._selectColor);

    return html`
      <div class="dialog">
        <div class="container">
            <h1>Select Colors</h1>

            <div class="current-color">
              <div style="background-color:${this._selectColor}" class="box"></div> 
              <div class="text-container">
                <h3>${selectColorName}</h3>
                <span style="color:${this._selectColor}">${this._selectColor}</span>
              </div>
            </div>

            <p>pick color you want to change</p>
            
            <ul>
              ${repeat([...Object.keys(ColorMap)],
                (colorName) => ColorMap[colorName],
                (colorName) => html`
                  <li 
                  id="color-${ColorMap[colorName]}" 
                  class="${selectColorName === colorName ? "choosed" : ""}" 
                  @click=${this.selectColorListener} 
                  >
                    <div style="background-color:${ColorMap[colorName]}" class="box"></div> 
                    <div class="text-container">
                      <h3>${colorName}</h3>
                      <span style="color:${ColorMap[colorName]}">${ColorMap[colorName]}</span>
                    </div>
                  </li>
                `)}
            </ul>

            <div class="btn-container">
              <button @click=${this.handleSubmit} class="cancel">cancel</button>
              <button @click=${this.handleSubmit} class="confirm">confirm</button>
            </div>
        </div>
      </div>
    `;
  }
}