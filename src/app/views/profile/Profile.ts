import { Interpreter } from "xstate";
import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { addWorkerListener, removeWorkerListener, sendToWorker } from "@utils/message";
import { AppContext, AppEvents } from "@state/App.state";

import type { ProfilePostEvents, WorkerPostEvents } from "@utils/events";

@customElement("view-profile")
class Profile extends LitElement {
  @property()
  appService?: Interpreter<AppContext, any, AppEvents>;

  @state()
  profiles: Array<TProfile> = []

  workerListener(e: MessageEvent<WebMessageForm<WorkerPostEvents>>) {
    if (e.data.type === "return-profiles") {
      this.profiles = [...e.data.data];

      if (this.profiles.length === 0) {
        this.appService?.send({
          type: "user choosed",
          name: undefined
        });
      }
    }
  }

  protected firstUpdated() {
    addWorkerListener(this.workerListener.bind(this))

    const requestProfile = () => {
      const message: WebMessageForm<ProfilePostEvents> = {
        origin: "view-profile",
        type: "get-profiles"
      };
      sendToWorker(message)
    }

    requestProfile();
  }

  chooseUser(e: Event) {
    const name = (e.currentTarget as Element).textContent!;

    this.appService?.send({
      type: "user choosed",
      name
    });
  }

  disconnectedCallback(): void {
    removeWorkerListener(this.workerListener);
  }

  render() {
    return html`
      <ul>
        Profile
        ${this.profiles.map((profile) => html`
          <li @click=${this.chooseUser}>${profile.username}</li>
        `)}
      </ul>
    `
  }
}