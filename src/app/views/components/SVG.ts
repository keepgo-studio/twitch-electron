import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

@customElement("component-svg")
class Svg extends LitElement {
  @property()
  fill = "#000";

  @property()
  width = 45;

  @property()
  height = 45;

  @property()
  data?: TSVGModule;

  render() {
    if (typeof this.data === "undefined") return "";

    return html`
      <style>
        svg {
          display: block;
          width: ${this.width}px;
          height: ${this.height}px;
        }
        svg, path, rect {
          fill: ${this.fill} !important;
        }
      </style>
      ${unsafeHTML(this.data)}
    `;
  }
}
