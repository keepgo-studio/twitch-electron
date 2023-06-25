import { LitElement, PropertyValueMap, html, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { addWorkerListener, removeWorkerListener, sendToWorker } from "@utils/message";

import styles from "./AddChannels.scss";

import type { AddChannelsPostEvents, WorkerPostEvents } from "@utils/events";

@customElement("view-add-channels")
class AddChannels extends LitElement {
  static styles = unsafeCSS(styles);

  @property({ type: Array })
  channels?: Array<TChannel>;
  @property()
  currentGroupId?: GroupId;
  
  @state()
  _chooseChannels: Array<BroadcasterId> = [];

  addChannelsWorkerListener(e: MessageEvent<WebMessageForm<WorkerPostEvents>>) {
    if (e.data.type === "result-change-channels-group") {
      const { channels, groups } = e.data.data;

      this.dispatchEvent(new CustomEvent("sync", {
        detail: {
          channels,
          groups
        },
        bubbles: true,
        composed: true
      }))

      this._chooseChannels = [];
    }
  }

  constructor() {
    super();

    addWorkerListener(this.addChannelsWorkerListener.bind(this));
  }

  disconnectedCallback(): void {
    removeWorkerListener(this.addChannelsWorkerListener)    
  }

  protected shouldUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): boolean {
      if (this.channels === undefined) return false;
      return true;
  }
  protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
      if (_changedProperties.has("currentGroupId")) this._chooseChannels = [];
  }
  clickToCheckChannel(e: MouseEvent) {
    const target = e.currentTarget as Element;
    const id = target.id.split("-")[1];

    if (target.classList.contains("choose")) {
      target.classList.remove("choose");
      this._chooseChannels = this._chooseChannels.filter(_id => _id !== id);
    }
    else {
      target.classList.add("choose");
      this._chooseChannels.push(id);
    }

    this._chooseChannels = [...this._chooseChannels]
  }

  clickSubmit() {
    const chooseChannels = this._chooseChannels.map(_id => this.channels!.find(_channel => _channel.broadcaster_id === _id));

    const message: WebMessageForm<AddChannelsPostEvents> = {
      origin: "view-add-channels",
      type: "change-channels-group",
      data: {
        channels: chooseChannels,
        groupId: this.currentGroupId
      }
    }
    sendToWorker(message);
  }
  
  render() {
    console.log(this._chooseChannels)
    const channelPerGroup: { [key: GroupId]: Array<TChannel> } = {};
    this.channels!.forEach(channel => {
      const groupId = channel.group_id;
      
      if (groupId === this.currentGroupId) return;

      if (!(groupId in channelPerGroup)) {
        channelPerGroup[groupId] = [];
      }

      channelPerGroup[groupId].push(channel);
    })

    return html`
      <div>
        current: ${this.currentGroupId}
        <button @click=${() => this.dispatchEvent(new CustomEvent("close"))}>close</button>
        <ul>
          ${repeat(
            Object.keys(channelPerGroup),
            (groupId) => groupId,
            (groupId) => html`
            <div>-----------</div>
            <h3>
              ${groupId}
            </h3>
            <ul>
              ${repeat(
                channelPerGroup[groupId],
                (channel) => channel.broadcaster_id,
                channel => html`
                <li id=${`channel-${channel.broadcaster_id}`} @click=${this.clickToCheckChannel}>
                ${channel.broadcaster_login} / ${channel.broadcaster_name}
                </li>
              `)}
            </ul>
            <div>-----------</div>
            `)}
        </ul>

        <button @click=${this.clickSubmit}>Group ${this.currentGroupId}에 channel ${this._chooseChannels.length}개 추가하기</button>
      </div>
    `
  }
}