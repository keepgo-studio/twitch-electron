import { LitElement, PropertyValueMap, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import "./channel/Channel";
import "./add-channels/AddChannels"

import type { GroupPostEvents } from "@utils/events";
import { sendToWorker } from "@utils/message";

@customElement("view-group")
class Group extends LitElement {
  @property({ type: Object })
  group?: TGroup
  
  @property({ type: Array })
  channels?: Array<TChannel>

  @property({ type: Array })
  liveChannels?: Array<TStream>

  @state()
  _openAddChannels = false;

  
  protected shouldUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): boolean {
    if (this.group === undefined || this.channels === undefined || this.liveChannels === undefined) return false;
    else return true;
  }
  protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (_changedProperties.has("group")) this._openAddChannels = false;
  }

  openPlayer() {

  }

  openAddChannelsView() {
    this._openAddChannels = true;
  }
  
  play() {
    this.dispatchEvent(new CustomEvent("play"));
  }

  removeChannelFromGroup(e: MouseEvent) {
    const target = e.currentTarget as Element;
    const id = target.id.split("-")[1];

    const removeChannel = this.channels?.find(_channel => _channel.broadcaster_id === id);

    const message: WebMessageForm<GroupPostEvents> = {
      origin: "view-group",
      type: "remove-channel-from-grpup",
      data: {
        channel: removeChannel,
        group: this.group
      }
    }
    sendToWorker(message);
  }

  render() {
    const groupHTML = () => {
      let channels;

      if (this.group!.name === "all")
        channels = [ ...this.channels! ];
      else 
        channels = this.channels!.filter(_channel => _channel.group_id === this.group?.name);
      
      channels.sort((a, b) => {
        const aLiveInfo = this.liveChannels!.find(_channel => _channel.user_id === a.broadcaster_id);
        const bLiveInfo = this.liveChannels!.find(_channel => _channel.user_id === b.broadcaster_id);

        if (aLiveInfo === undefined) return 1;
        else if (bLiveInfo === undefined) return -1;
        else if (aLiveInfo.viewer_count < bLiveInfo.viewer_count) return 1;
        else return -1;
      })

      return html`
        <ul>
          ${repeat(
            channels,
            (channel) => channel.broadcaster_id,
            (channel) => {
              const liveInfo = this.liveChannels!.find(_channel => _channel.user_id === channel.broadcaster_id)

              return html`
                <li>
                  ${channel.broadcaster_name}
                  <button @click=${this.play}>play</button>
                  <p>is live: ${liveInfo && liveInfo.viewer_count}</p>
                  ${(this.group!.name !== "all" && this.group!.name !== "etc") ?
                   html`<button 
                   id=${`btn-${channel.broadcaster_id}`} 
                   @click=${this.removeChannelFromGroup}
                   >(X)</button>`: ""}
                </li>
              `
            })}
        </ul>
      `;
    }

    return html`
      <section>
        ${groupHTML()}

        ${this.group?.name === "all" ? html``: html`
          <div>
            <button @click=${this.openAddChannelsView}>add new channels</button>
          </div>
        `}

        ${this._openAddChannels  ? 
        html`
          <view-add-channels .currentGroupId=${this.group?.name} .channels=${this.channels}></view-add-channels>
        `
        :""}
      </section>
    `;
  }
}