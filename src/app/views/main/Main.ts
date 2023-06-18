import { LitElement, PropertyValueMap, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { GroupListEvents } from "@views/main/group-list/GroupList";
import { Prompt } from "@views/components/Dialog";

import "@views/main/group-list/GroupList"
import "@views/main/group/Group"
import "@views/bottom-navbar/BottomNavbar"

import type { TotalData } from "@views/App";
import type { BottomNavbarEvents, BottomNavbarDataType } from "@views/bottom-navbar/BottomNavbar";
import type { WorkerHandlingEvents } from "worker";

type MainViewHandlingEvents =
  | "append group result"
  | "getting group list result";

export type {
  MainViewHandlingEvents
}

@customElement("view-main")
class Main extends LitElement {
  @property()
  data!: TotalData;

  @property()
  userInfo!: TUserInfo;

  /**
   * group id 0 = "all" 1 = "etc"
   * 0 didn't save at idb
   */
  @state()
  _bottomNavbarData: BottomNavbarDataType

  @query("#main-section")
  MainSection: Element;

  private _connectedChannels = [];

  constructor() {
    super() ;

    this._bottomNavbarData = {
      aot: true,
      currentGroupId: 0,
      mode: "player"
    }
  }

  connectSocketForChannel(channel: TChannel) {
    // TODO: socket connection for getting live event
    // this._connectedChannels
  }

  protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (_changedProperties.has("data")) {
      this.data.follow_list.forEach((channel) => {
        
        if (!(channel.broadcaster_id in this._connectedChannels))
          this.connectSocketForChannel(channel)
      })
    }
    
    if (_changedProperties.has("userInfo")) {
      this._bottomNavbarData = {
        aot: this.userInfo.AOT,
        currentGroupId: this._bottomNavbarData.currentGroupId,
        mode: this.userInfo.mode
      }
    }
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    this.MainSection.addEventListener(
      "bottom-nav-bar",
      (e: CustomEvent) => {
        const eventType = e.detail.type as BottomNavbarEvents;

        if(eventType === "toggle AOT") {
          window.api.toggleAlwaysOnTop().then(result => {
            window.worker.postMessage({
              type: "save-AOT",
              data: result
            } as WebMessageForm<WorkerHandlingEvents>)
            
            this._bottomNavbarData.aot = result;
            this._bottomNavbarData = { ...this._bottomNavbarData }
          });
        }
        else if (eventType === "change group name") {
          if (this._bottomNavbarData.currentGroupId === 0) {
            // TODO: alram that user cannot change group name for all tab
            return;
          }

          new Prompt('Type changed group name').show().then(newName => {
            // TODO: need to sync with worker
            window.worker.postMessage({
              type: "change-group-name",
              data: {
                groupId: this._bottomNavbarData.currentGroupId,
                newName
              },
            } as WebMessageForm<WorkerHandlingEvents>);
          })
        }
        else if (eventType === "go home") {
          this._bottomNavbarData.currentGroupId = 0;
          this._bottomNavbarData = { ...this._bottomNavbarData }
        }
        else if (eventType === "change mode") {
          // this._playerMode
        }
        else if (eventType === "open setting") {

        }
      }
    )

    this.MainSection.addEventListener("group-list", (e:CustomEvent) => {
      const eventType = e.detail.type as GroupListEvents;

      if (eventType === "append new group") {
        new Prompt('Type new group name').show().then(newGroupName => {
          window.worker.postMessage({
            type: "append-new-group",
            data: newGroupName,
          } as WebMessageForm<WorkerHandlingEvents>);
        })
      }
    })

    window.worker.addEventListener("message", (e: MessageEvent<WebMessageForm<MainViewHandlingEvents>>) => {
      if (e.data.type === "append group result") {
        window.worker.postMessage({
          type: "get-store-group-list",
        } as WebMessageForm<WorkerHandlingEvents>);
      }
      else if (e.data.type === "getting group list result") {
        console.log("get data", e.data.data);
      }
    })
  }

  render() {
    return html`
      <section id="main-section">
        <view-group-list 
          .groups=${this.data?.group_list}
        ></view-group-list>

        <main>
          <view-group
            .data=${this.data}
            .groupId=${this._bottomNavbarData.currentGroupId}
          ></view-group>
        </main>

        <view-bottom-navbar
          .data=${this._bottomNavbarData}
        ></view-bottom-navbar>
      </section>

      <section>
      <!-- Player -->
      </section>
    `;
  }
}
