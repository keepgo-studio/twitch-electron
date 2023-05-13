import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("view-skeleton")
class Skeleton extends LitElement {
  static styles = css`
    * {
      padding: 0;
      margin: 0;
      box-sizing: border-box;
    }

    li {
      display: block;
    }
  `
  render() {
    return html`
      <div>
        <section class="group-list"></section>
        skeleton
        <section class="group">
          <ul>
            <li class="channel"></li>
            <li class="channel"></li>
            <li class="channel"></li>
          </ul>
        </section>
      </div>
    `;
  }
}