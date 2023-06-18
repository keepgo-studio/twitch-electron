import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

type GroupListEvents =
  | "append new group"
  | "play channel"
  | "select group"

export type { 
  GroupListEvents,
};

@customElement("view-group-list")
class GroupList extends LitElement {
  @property()
  groups?: Array<TGroup>;

  // drag and drop

  addGroup() {
    this.parentElement?.dispatchEvent(new CustomEvent("group-list", {
      detail: {
        type: "append new group"
      }
    }))
  }

  render() {
    return html`
      <ul>
        <li>all</li>

        ${this.groups?.map(group=> html`
          <li>${group.name}</li>
        `)}

        <li @click=${this.addGroup}>add(+)</li>
      </ul>
    `;
  }
}