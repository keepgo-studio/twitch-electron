import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("view-group-list")
class GroupList extends LitElement {
  @property()
  groups?: Array<TGroup>;

  // drag and drop

  render() {
    return html`
      <ul>
        <li>all</li>

        ${this.groups?.map(group=> html`
          <li>${group.name}</li>
        `)}
      </ul>
    `;
  }
}