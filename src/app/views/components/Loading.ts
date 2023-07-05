import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";

import styles from "./Loading.scss";

@customElement("component-loading")
class Loading extends LitElement {
  static styles = unsafeCSS(styles);

  @property()
  width = "10vw";

  render() {
    return html`
      <style>
        .loading-spinner {
          width: ${this.width};
        }
      </style>

      <div class="loading-spinner">
        <svg class="loading-spinner__circle-svg" viewBox="25 25 50 50">
          <circle
            class="loading-spinner__circle-stroke"
            cx="50"
            cy="50"
            r="20"
            fill="none"
            stroke-width="2"
            stroke-miterlimit="10"
          />
        </svg>
      </div>
    `;
  }
}
