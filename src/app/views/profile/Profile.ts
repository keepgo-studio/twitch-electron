import { Interpreter } from "xstate";
import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import {
  addWorkerListener,
  removeWorkerListener,
  sendToWorker,
} from "@utils/message";
import { AppContext, AppEvents } from "@state/App.state";
import { Back, Expo, gsap } from "gsap";

import type { ProfilePostEvents, WorkerPostEvents } from "@utils/events";

import styles from "./Profile.scss";

@customElement("view-profile")
class Profile extends LitElement {
  static styles = unsafeCSS(styles);

  @property({ type: Object })
  appService?: Interpreter<AppContext, any, AppEvents>;

  @property({
    type: Boolean,
    reflect: true,
  })
  loading = false;

  @state()
  profiles: Array<TProfile> = [];

  @query(".logo-container > img")
  logo: HTMLElement;

  @query(".profile-list")
  profileList: HTMLElement;

  @query(".new-btn")
  newBtn: HTMLElement;

  workerListener(e: MessageEvent<WebMessageForm<WorkerPostEvents>>) {
    if (e.data.type === "return-profiles") {
      this.profiles = [...e.data.data];
    }
  }

  protected firstUpdated() {
    addWorkerListener(this.workerListener.bind(this));

    const requestProfile = () => {
      const message: WebMessageForm<ProfilePostEvents> = {
        origin: "view-profile",
        type: "get-profiles",
      };
      sendToWorker(message);
    };

    requestProfile();

    const animation = async () => {
      const logoComp = this.logo.getBoundingClientRect();

      gsap
        .timeline()
        .set(this.logo, {
          position: "absolute",
          xPercent: -50,
          yPercent: -50,
          left: "50%",
          top: "50%",
          opacity: 0,
        })
        .to(this.logo, {
          opacity: 1,
          duration: 0.7,
          ease: Expo.easeOut,
          delay: 0.5,
        })
        .to(this.logo, {
          top: logoComp.y,
          duration: 1.5,
          ease: Back.easeInOut,
          delay: 0.5,
          clearProps: "position,transform",
        })
        .fromTo(
          this.profileList,
          {
            y: 10,
          },
          {
            y: 0,
            opacity: 1,
            duration: 1.5,
            ease: Expo.easeOut,
          },
          "-=0.3"
        )
        .to(
          this.newBtn,
          {
            opacity: 1,
            duration: 1.5,
            ease: Expo.easeOut,
          },
          "-=1.5"
        );
    };

    animation();
  }

  chooseUser(e: Event) {
    if (this.loading) return;

    this.loading = true;

    const name = (e.currentTarget as Element).textContent!;

    this.appService?.send({
      type: "user choosed",
      name,
    });
  }

  newUser() {
    this.appService?.send({
      type: "user choosed",
      name: undefined,
    });
  }

  disconnectedCallback(): void {
    removeWorkerListener(this.workerListener);
  }

  render() {
    return html`
      <div id="profile">
        <div class="logo-container">
          <img src="public/logo.png" />
        </div>

        <ul class="profile-list">
          ${this.profiles.map(
            (profile) => html`
              <li @click=${this.chooseUser}>
                <img src="${profile.profile_image_url}" />

                <p>
                  ${this.loading
                    ? html`<component-loading></component-loading>`
                    : profile.username}
                </p>
              </li>
            `
          )}
        </ul>

        <button class="new-btn" @click=${this.newUser}>
          <img src="public/add_user.png" />
        </button>
      </div>
    `;
  }
}
