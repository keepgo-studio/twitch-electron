import { LitElement, PropertyValueMap, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

@customElement("view-group-list")
class GroupList extends LitElement {  
  @property({ type: Array })
  groups?: Array<TGroup>;

  // drag and drop

  fireEvent(e: MouseEvent) {
    const target = e.currentTarget as Element;
    const eventType = target.className;

    this.dispatchEvent(new CustomEvent(eventType));
  }

  protected shouldUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): boolean {
      if (this.groups === undefined) return false;
      return true;
  }

  changeGroup(e: MouseEvent) {
    const target = e.currentTarget as Element;
    const groupId = target.id.split('-')[1];

    this.dispatchEvent(new CustomEvent("changeGroup", {
      detail: groupId
    }));
  }

  render() {
    const exceptEtc = this.groups!.filter(_group => _group.name !== "etc")
    const etc = this.groups!.find(_group => _group.name === "etc");

    // return html`
    //   <ul>
    //     <li @click=${this.changeGroup} id="groupd-all">all</li>

    //     ${repeat(
    //       exceptEtc!,
    //       (group) => group.name,
    //       (group) => html`
    //         <li @click=${this.changeGroup} id=${`group-${group.name}`}>${group.name}</li>
    //       `
    //     )}

    //     <li @click=${this.changeGroup} id="group-etc">${etc?.name}</li>
    //     <li @click=${this.fireEvent} class="addNewGroup">add(+)</li>
    //   </ul>
    // `;
  }
}