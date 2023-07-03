import { LitElement, PropertyValueMap, html, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { addWorkerListener, removeWorkerListener, sendToWorker } from "@utils/message";
import { DialogCore } from "@views/components/Dialog";

import styles from "./AddChannels.scss";

import type { AddChannelsPostEvents, WorkerPostEvents } from "@utils/events";

@customElement("component-add-channels")
export class AddChannelsDialog extends DialogCore {
  static styles = unsafeCSS(styles);

  private _caller: Element;
  private _noChannels = false;

  @state()
  _channels?: Array<TChannel>;

  @state()
  _currentGroupId?: GroupId;
  
  @state()
  _chooseChannels: Array<BroadcasterId>= [];

  addChannelsWorkerListener(e: MessageEvent<WebMessageForm<WorkerPostEvents>>) {
    if (e.data.type === "result-change-channels-group") {
      const { channels, groups } = e.data.data;

      this._caller.dispatchEvent(new CustomEvent("sync", {
        detail: {
          channels,
          groups
        },
        bubbles: true,
        composed: true
      }))

      this._closeDialog = true;
    }
  }

  constructor(parent:Element, currentGroupId: GroupId, channels: Array<TChannel>) {
    super();
    
    this._caller = parent;
    this._currentGroupId = currentGroupId;
    this._channels = [...channels];
    this._chooseChannels = [];

    addWorkerListener(this.addChannelsWorkerListener.bind(this));
  }

  disconnectedCallback(): void {
    removeWorkerListener(this.addChannelsWorkerListener)    
  }

  protected shouldUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): boolean {
      if (this._channels === undefined) return false;
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

  submitToWorker() {
    const chooseChannels = this._chooseChannels.map(_id => this._channels!.find(_channel => _channel.broadcaster_id === _id));

    const message: WebMessageForm<AddChannelsPostEvents> = {
      origin: "view-add-channels",
      type: "change-channels-group",
      data: {
        channels: chooseChannels,
        groupId: this._currentGroupId
      }
    }
    sendToWorker(message);
  }
  
  public returnValue() {
    if (this._noChannels) return undefined;

    return this._chooseChannels;
  }

  private handleSubmit(e: Event) {
    const target = e.currentTarget as Element;
    const btnType = target.className.split(" ")[0];

    if (btnType === 'confirm') {
      this.submitToWorker();
    } else {
      this._chooseChannels = [];
      this._closeDialog = true;
    }
  }

  render() {
    const channelPerGroup: { [key: GroupId]: Array<TChannel> } = {};

    this._channels!.forEach(channel => {
      const groupId = channel.group_id;
      if (groupId === this._currentGroupId) return;
      
      if (!(groupId in channelPerGroup)) {
        channelPerGroup[groupId] = [];
      }

      channelPerGroup[groupId].push(channel);
    })

    if (Object.keys(channelPerGroup).length === 0) {
      console.log("all channels in here");
      this._noChannels = true;
      this._closeDialog = true;
    }

    return html`
      <section id="add-channels">
        <div class="container">
          <div class="header">
            <h3>Group </h3>
            <h1>${this._currentGroupId}</h1>
            <p>current <span>${this._chooseChannels.length} channels</span> selected</p>
          </div>

          <ul>
          ${repeat(
            Object.keys(channelPerGroup),
            (groupId) => groupId,
            (groupId) => html`
            <li class="group-container">
              <h3>
                ${groupId}
              </h3>
              <ul class="group-list">
                ${repeat(
                  channelPerGroup[groupId],
                  (channel) => channel.broadcaster_id,
                  channel => html`
                  <li id=${`channel-${channel.broadcaster_id}`} @click=${this.clickToCheckChannel}>
                    <img src="${channel.profile_image_url}"/>    

                    <p>${channel.broadcaster_name}</p>
                  </li>
                `)}
              </ul>
            </li>
            `)}
          </ul>

          <div class="btn-container">
            <button 
            class="cancel"
            @click=${this.handleSubmit}
            >Cancel</button>

            <button 
            class="confirm ${this._chooseChannels.length === 0 ? "empty" : ""}"
            @click=${this.handleSubmit}
            >Confirm</button>
          </div>
        </div>
      </section>
    `
  }
}