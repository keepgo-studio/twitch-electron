import { LitElement, html, unsafeCSS } from "lit";
import { customElement, query } from "lit/decorators.js";

import styles from "./Skeleton.scss";
import PlaySVG from "@public/play_circle_filled.svg";
import { Expo, gsap } from "gsap";

@customElement("view-skeleton")
class Skeleton extends LitElement {
  static styles = unsafeCSS(styles);

  @query(".body ul")
  groupListUl: Element;

  @query(".body .group-header")
  bodyHeader: Element;

  @query("header")
  header: Element;

  @query("footer")
  footer: Element;

  constructor() {
    super();

    const animation = () => {
      gsap
      .fromTo(this.header, {
        yPercent: -100,
        duration: 1,
        opacity: 0,
        ease: Expo.easeOut
      }, {
        yPercent: 0,
        opacity: 1,
      })
  
      gsap.fromTo(this.footer, {
        opacity: 0,
        duration: 1,
        ease: Expo.easeOut
      }, {
        opacity: 1,
      })
      
      const lis = this.groupListUl.querySelectorAll("li");

      gsap.timeline({
        repeat: -1
      })
      .fromTo(this.groupListUl, {
        y: 20,
        opacity: 0,
        duration: 1,
        ease: Expo.easeOut,
      }, {
        y: 0,
        opacity: 1,
      })
      .fromTo(lis,{
        y: 10,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: {
          each: 0.3,
        },
        ease: Expo.easeOut
      })
      .set({}, { delay: 4 })
    }
    this.addEventListener("show-page", animation.bind(this));
  }

  @query("")
  render() {
    return html`
      <div id="skeleton">
        <header>
          <div></div>
        </header>

        <section class="body">
          <div class="group-header">
            <h3>Group</h3>

            <div class="group-info">
              <div class="group-name-box linear-effect"></div>
  
              <div class="channel-info-container">
                <p class="channels-box linear-effect"></p>
                <p class="live-box linear-effect"></p>
              </div>
            </div>
          </div>

          <ul>
            ${[...new Array(2)].map(() => html`
            <li>
              <div class="thumnbnail-icon">
                <i></i>
              </div>
              <div>
                <div class="chennel-name-box linear-effect"></div>
                <div class="viewer-count-box linear-effect"></div>
              </div>
              <div class="play-icon">
                <component-svg 
                .fill=${"#fff"}
                .data=${PlaySVG}
                .width=${32}
                ></component-svg>
              </div>
            </li>
            `)}

            <li></li>
          </ul>
        </section>

        <footer>
          <div class="box"></div>
        </footer>
      </div>
    `;
  }
}