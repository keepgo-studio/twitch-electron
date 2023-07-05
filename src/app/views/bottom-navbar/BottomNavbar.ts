import { LitElement, PropertyValueMap, html, unsafeCSS } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { Expo, gsap } from "gsap";

import styles from "./BottomNavbar.scss";

import AotTrueSVG from "@public/window.up.svg";
import AotFalseSVG from "@public/window.down.svg";
import WriteSVG from "@public/rectangle.and.pencil.and.ellipsis.svg";
import HomeSVG from "@public/home.svg";
import PalleteSVG from "@public/palette.svg";
import TwitchSVG from "@public/twitch.svg";


type IconTypes = 
  | "aot" 
  | "changeGroupName" 
  | "goHome" 
  | "changeColor"
  | "syncFromTwitch"
  ;

const iconInfo = {
  "aot": 24,
  "changeGroupName": 24,
  "goHome": 32, 
  "changeColor": 26, 
  "syncFromTwitch": 20
}

let shadowGsapId: GSAPTimeline | undefined;

@customElement("view-bottom-navbar")
class BottomNavbar extends LitElement {
  static styles = unsafeCSS(styles);

  @property({ type: Object })
  userInfo?: TUserInfo;

  @query("nav")
  root: Element;

  @query(".shadow")
  shadow: Element;

  @query(".container ul")
  menuListUl: Element;

  fireEvent(e: MouseEvent) {
    const target = e.currentTarget as Element;
    const eventType = target.className as IconTypes;

    this.dispatchEvent(new CustomEvent(eventType));
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {  
    this.root.addEventListener("mouseenter", () => {
      if (shadowGsapId) shadowGsapId.kill();

      shadowGsapId = gsap.timeline()
      .set(this.shadow, {
        display: "block",
        opacity: 0,
      })
      .to(this.shadow, {
        opacity: 1,
        duration: 0.5,
        ease: Expo.easeOut,
        onComplete: () => shadowGsapId = undefined
      })
    });
    this.root.addEventListener("mouseleave", () => {
      if (shadowGsapId) shadowGsapId.kill();
      
      shadowGsapId = gsap.timeline()
      .to(this.shadow, {
        opacity: 0,
        duration: 0.5,
        ease: Expo.easeOut,
      })
      .set(this.shadow, {
        display: "none",
        opacity: 0,
        onComplete: () => shadowGsapId = undefined
      })
    });

    [...this.menuListUl.querySelectorAll("li:not(.goHome)")].forEach(li => {
      const hoverDiv = li.querySelector(".hover-effect")! as HTMLElement;
      const iconTarget = li.className as IconTypes;
  
      hoverDiv.style.width = `${iconInfo[iconTarget]}px`;
    });
  }

  render() {
    return html`
      <div class="shadow"></div>

      <nav>
        <div class="container">
          <ul>
            <li class="aot" @click=${this.fireEvent}>
              ${this.userInfo?.AOT
                ? html`
                  <component-svg
                    .width=${iconInfo.aot}
                    .height=${-1}
                    .fill=${"inherit"}
                    .data=${AotTrueSVG}
                  ></component-svg>`
                : html`
                  <component-svg
                  .width=${iconInfo.aot}
                  .height=${-1}
                  .fill=${"inherit"}
                  .data=${AotFalseSVG}
                  ></component-svg>
                `}

              <div class="hover-effect"></div>
            </li>
            <li class="changeGroupName" @click=${this.fireEvent}>
              <component-svg 
              .width=${iconInfo.changeGroupName}
              .height=${-1}
              .fill=${"inherit"} 
              .data=${WriteSVG}></component-svg>

              <div class="hover-effect"></div>
            </li>
            <li class="goHome" @click=${this.fireEvent}>
              <div class="home-wrapper">
                <component-svg 
                .width=${iconInfo.goHome}
                .height=${-1}
                .fill=${"inherit"} 
                .data=${HomeSVG}></component-svg>
              </div>
            </li>
            <li class="changeColor" @click=${this.fireEvent}>
              <component-svg 
              .width=${iconInfo.changeColor}
              .height=${-1}
              .fill=${"inherit"} 
              .data=${PalleteSVG}></component-svg>

              <div class="hover-effect"></div>
            </li>
            <li class="syncFromTwitch" @click=${this.fireEvent}>
              <component-svg 
              .width=${iconInfo.syncFromTwitch}
              .height=${-1}
              .fill=${"inherit"} 
              .data=${TwitchSVG}></component-svg>

              <div class="hover-effect"></div>
            </li>
          </ul>
        </div>
      </nav>
    `;
  }
}
