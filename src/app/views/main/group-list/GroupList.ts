import { LitElement, PropertyValueMap, html, unsafeCSS } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { Draggable } from "gsap/Draggable";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Elastic, Expo, gsap } from "gsap";

import styles from "./GroupList.scss";

import PlusSVG from "@public/plus_round.svg";

const DURATION = 1;

const openMacro = (header: Element, shadow:Element, maxHeight: number) => {
  gsap
  .timeline()
  .set(shadow, {
    opacity: 0,
    display: "block"
  })
  .to(header, {
    y: maxHeight,
    ease: Elastic.easeOut,
    duration: DURATION,
  })
  .to(shadow, {
    opacity: 1,
    ease: Expo.easeOut,
    duration: 0.3
  }, "-=1");
}

const closeMacro = (header: Element, shadow:Element) => {
  gsap
  .timeline()
  .to(header, {
    y: 0,
    ease: Elastic.easeOut,
    duration: DURATION,
  })
  .to(shadow, {
    opacity: 0,
    ease: Expo.easeOut,
    duration: 0.3
  }, "-=1")
  .set(shadow, {
    opacity: 0,
    display: "none"
  });
}

@customElement("view-group-list")
class GroupList extends LitElement {
  static styles = unsafeCSS(styles);

  @property({ type: Array })
  groups?: Array<TGroup>;

  @query("header")
  header: HTMLElement;
  
  @query(".shadow")
  shadow: HTMLElement;

  @query(".list ul")
  groupListUl: Element;

  constructor() {
    super();

    this.addEventListener("fold", () => {
      closeMacro(this.header, this.shadow);
    })
  }

  fireEvent(e: MouseEvent) {
    const target = e.currentTarget as Element;
    const eventType = target.className;

    this.dispatchEvent(new CustomEvent(eventType));
  }

  protected shouldUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): boolean {
    if (this.groups === undefined) return false;
    return true;
  }

  changeGroup(e: MouseEvent) {
    const target = e.currentTarget as Element;
    const groupId = target.id.split("-")[1];

    this.dispatchEvent(
      new CustomEvent("changeGroup", {
        detail: groupId,
      })
    );

    target.scrollIntoView({
      behavior: "smooth"
    });
  }

  protected updated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    const container = this.header.querySelector(".container");
    const maxHeight = container!.clientHeight;
    const header = this.header;
    const shadow = this.shadow;
    const d = maxHeight / 5;

    Draggable.create(header, {
      type: "y",
      bounds: {
        minY: 0,
        maxY: maxHeight,
      },
      onDragEnd: function () {
        const direction = this.getDirection();
        
        if (direction === 'down') {
          if (this.y >= d) {
            openMacro(header, shadow, maxHeight);
          }
          else {
            closeMacro(header, shadow);
          }
        } 
        else if (direction === 'up'){
          if (this.y <= d * 4) {
            closeMacro(header, shadow);
          }
          else {
            openMacro(header, shadow, maxHeight);
          }
        }
      },
      lockAxis: true
    });

    this.groupListUl.addEventListener("wheel", (e: WheelEvent) => {
      if (!e.deltaY) return;

      e.preventDefault();
      this.groupListUl.scrollLeft += e.deltaY + e.deltaX;
    })

    const ul = this.groupListUl;
    const ulScrollT = ScrollTrigger.create({
      trigger: this.groupListUl,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: function(self) {
        gsap.to(ul, { 
          scrollLeft: self.progress * (ul.scrollWidth - ul.clientWidth),
          overwrite: true 
        });
      },
    })

    Draggable.create(ul, {
      type: "scrollLeft",
      edgeResistance: 0.65,
      throwProps: true,
      onDragStart: function() {
        ulScrollT.update();    
      },
      lockAxis: true
    })

    "pointerdown,touchstart,mousedown".split(",").forEach(eventType => {
      ul.addEventListener(eventType, e => e.stopImmediatePropagation());
    });
  }

  openHeader() {
    const container = this.header.querySelector(".container");
    const maxHeight = container!.clientHeight;
    const dragInstance = Draggable.get(this.header);

    if (dragInstance) {
      if (dragInstance.y >= maxHeight - 5) {
        closeMacro(this.header, this.shadow);
      }
      else {
        openMacro(this.header, this.shadow, maxHeight);
      }
    }
  }

  render() {
    const exceptEtc = this.groups!.filter((_group) => _group.name !== "etc");
    const etc = this.groups!.find((_group) => _group.name === "etc");
    const totalChannels = this.groups!.reduce(
      (prev, curr) => prev + curr.channels.length,
      0
    );

    return html`
      <header>
        <div @click=${this.openHeader} class="drag-button">
          <i></i>
        </div>

        <div class="container">
          <div class="logo">
            <img src="public/group_list.png" />
          </div>

          <div class="list">
            <ul>
              <li @click=${this.changeGroup} id="groupd-all">
                <div style="background-color: #fff" class="box"></div>
                <h3 style="color: #fff">all</h3>
                <p>${totalChannels} channels</p>
              </li>
  
              ${repeat(
                exceptEtc!,
                (group) => group.name,
                (group) => html`
                  <li @click=${this.changeGroup} id=${`group-${group.name}`}>
                    <div
                      style="background-color: ${group.color}"
                      class="box"
                    ></div>
                    <h3 style="color:${group.color}">${group.name}</h3>
                    <p>${group.channels.length} channels</p>
                  </li>
                `
              )}
  
              <li @click=${this.changeGroup} id="group-etc">
                <div style="background-color: ${etc!.color}" class="box"></div>
                <h3 style="color:${etc!.color}">${etc!.name}</h3>
                <p>${etc!.channels.length} channels</p>
              </li>
            </ul>
            <div @click=${this.fireEvent} class="addNewGroup">
              <component-svg
              .width=${24}
              .fill=${"inherit"}
              .data=${PlusSVG}></component-svg>
            </div>
          </div>
        </div>
      </header>

      <div class="shadow"></div>

      <div class="back"></div>
    `;
  }
}
