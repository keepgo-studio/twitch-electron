import { LitElement, PropertyValueMap, html, unsafeCSS } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { sendToWorker } from "@utils/message";

import "./channel/Channel";
import "./add-channels/AddChannels";

import type { GroupPostEvents } from "@utils/events";

import styles from "./Group.scss";
import PlaySVG from "@public/play_circle_filled.svg";

@customElement("view-group")
class Group extends LitElement {
  static styles = unsafeCSS(styles);

  @property({ type: Object })
  group?: TGroup;

  @property({ type: Array })
  channels?: Array<TChannel>;

  @property({ type: Array })
  liveChannels?: Array<TStream>;

  @state()
  _openAddChannels = false;

  @query(".body")
  bodyElem: Element;

  protected shouldUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): boolean {
    if (
      this.group === undefined ||
      this.channels === undefined ||
      this.liveChannels === undefined
    )
      return false;
    else return true;
  }
  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (_changedProperties.has("group")) this._openAddChannels = false;
  }

  firstUpdated() {
    const io = new IntersectionObserver(
      (entries, _) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const container = entry.target.querySelector(".channel-container");
            container!.classList.add("show");
          } else {
            const container = entry.target.querySelector(".channel-container");
            container!.classList.remove("show");
          }
        });
      },
      {
        root: this.bodyElem,
        threshold: 0.2,
      }
    );

    [...this.bodyElem.querySelectorAll("ul > li")].forEach((li) =>
      io.observe(li)
    );
  }

  openPlayer() {}

  openAddChannelsView() {
    this._openAddChannels = true;
  }

  play(e: MouseEvent) {
    const target = e.currentTarget as Element;
    const id = target.id.split("-")[1];

    this.dispatchEvent(
      new CustomEvent("play", {
        detail: id,
      })
    );
  }

  removeChannelFromGroup(e: MouseEvent) {
    const target = e.currentTarget as Element;
    const id = target.id.split("-")[1];

    const removeChannel = this.channels?.find(
      (_channel) => _channel.broadcaster_id === id
    );

    const message: WebMessageForm<GroupPostEvents> = {
      origin: "view-group",
      type: "remove-channel-from-grpup",
      data: {
        channel: removeChannel,
        group: this.group,
      },
    };
    sendToWorker(message);
  }

  render() {
    const groupColor = this.group?.name === "all" ? "#fff" : this.group?.color;

    const groupHTML = () => {
      let channels;

      if (this.group!.name === "all") channels = [...this.channels!];
      else
        channels = this.channels!.filter(
          (_channel) => _channel.group_id === this.group?.name
        );

      channels.sort((a, b) => {
        const aLiveInfo = this.liveChannels!.find(
          (_channel) => _channel.user_id === a.broadcaster_id
        );
        const bLiveInfo = this.liveChannels!.find(
          (_channel) => _channel.user_id === b.broadcaster_id
        );

        if (aLiveInfo === undefined) return 1;
        else if (bLiveInfo === undefined) return -1;
        else if (aLiveInfo.viewer_count < bLiveInfo.viewer_count) return 1;
        else return -1;
      });

      return html`
        <ul>
          ${repeat(
            channels,
            (channel) => channel.broadcaster_id,
            (channel) => {
              const liveInfo = this.liveChannels!.find(
                (_channel) => _channel.user_id === channel.broadcaster_id
              );

              return html`
                <li>
                  <div class="channel-container">
                    <div class="thumnbnail-icon">
                      <img
                        class="${liveInfo ? "online" : "offline"}"
                        src=${channel.profile_image_url === ""
                          ? "public/account_circle.png"
                          : channel.profile_image_url}
                      />
                    </div>
                    <div class="text-container">
                      <div class="channel-name">
                        ${channel.broadcaster_name}
                      </div>
                      <div class="viewer-count">
                        ${liveInfo
                          ? html`
                              <i></i>
                              <span class="online">
                                ${liveInfo.viewer_count}
                              </span>
                            `
                          : html`<span class="offline">offline</span>`}
                      </div>
                    </div>
                    <div
                      id=${`play-${channel.broadcaster_id}`}
                      style="fill:${groupColor}"
                      class="play-icon"
                      @click=${this.play}
                    >
                      <component-svg
                        .fill=${"inherit"}
                        .data=${PlaySVG}
                        .width=${32}
                      ></component-svg>
                    </div>
                  </div>

                  ${this.group!.name !== "all" && this.group!.name !== "etc"
                    ? html` <button
                        id=${`btn-${channel.broadcaster_id}`}
                        @click=${this.removeChannelFromGroup}
                      >
                        (X)
                      </button>`
                    : ""}
                </li>
              `;
            }
          )}
        </ul>
      `;
    };

    return html`
      <style>
        .body::-webkit-scrollbar-thumb {
          background-color: ${groupColor};
        }
      </style>

      <section id="group">
        <div class="group-header">
          <h3>Group</h3>

          <div class="group-info">
            <div style="color:${groupColor}" class="group-name">
              ${this.group?.name}
            </div>

            <div class="channel-info-container">
              <p class="channels"><b>${this.channels?.length}</b> channels</p>
              <p class="live">
                <b>${this.liveChannels?.length} online</b>
              </p>
            </div>
          </div>
        </div>

        <section class="body">${groupHTML()}</section>

        ${this.group?.name === "all"
          ? html``
          : html`
              <div class="add-channels">
                <button @click=${this.openAddChannelsView}>
                  <img src="public/add_channels.png" />
                </button>
              </div>
            `}
        ${this._openAddChannels
          ? html`
              <view-add-channels
                @close=${() => (this._openAddChannels = false)}
                .currentGroupId=${this.group?.name}
                .channels=${this.channels}
              ></view-add-channels>
            `
          : ""}
      </section>
    `;
  }
}
