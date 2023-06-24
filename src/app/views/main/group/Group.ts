import { LitElement, PropertyValueMap, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import "@views/main/group/channel/Channel";
import "@views/main/group/add-channels/AddChannels";

@customElement("view-group")
class Group extends LitElement {
  @property({ type: Object })
  group?: TGroup
  
  @state()
  _openAddChannels = false;
  
  @property({ type: Array })
  channels?: Array<TChannel>

  @property({ type: Array })
  liveChannels?: Array<TStream>

  
  protected shouldUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): boolean {
    if (this.group === undefined || this.channels === undefined || this.liveChannels === undefined) return false;
    else return true;
  }

  openPlayer() {

  }

  openAddChannelsView() {
    this._openAddChannels = true;
  }
  
  render() {
    const groupHTML = () => {
      let channels;

      if (this.group!.name === "all")
        channels = [ ...this.channels! ];
      else 
        channels = this.channels!.filter(_channel => _channel.broadcaster_id in this.group!.channels);
      
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
                  <p>is live: ${liveInfo && liveInfo.viewer_count}</p>
                </li>
              `
            })}
        </ul>
      `;
    }

    return html`
      <section>
        ${groupHTML()}

        <div>
          <button @click=${this.openAddChannelsView}>add new channels</button>
        </div>

        ${this._openAddChannels ? html`<view-add-channels></view-add-channels>` : ''}
      </section>
    `;
  }
}