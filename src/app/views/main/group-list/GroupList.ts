import { ViewCore } from "@utils/core";
import { PropertyValueMap, html, unsafeCSS } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { Draggable } from "gsap/Draggable";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Expo, gsap } from "gsap";

import styles from "./GroupList.scss";

import PlusSVG from "@public/plus_round.svg";
import CloseSVG from "@public/x.circle.fill.svg"


const DURATION = 0.5;

let tlId: GSAPTimeline | undefined;

const openMacro = (root: Element, shadow:Element, maxHeight: number) => {
  if (tlId !== undefined) {
    tlId.kill();
  }

  tlId = gsap
  .timeline()
  .set(shadow, {
    opacity: 0,
    display: "block"
  })
  .to(root, {
    y: maxHeight,
    ease: Expo.easeOut,
    duration: DURATION,
  })
  .to(shadow, {
    opacity: 1,
    ease: Expo.easeOut,
    duration: 0.3
  }, "-=1")
  .set(shadow, {
    display:"block",
    opacity: 1,
    onComplete: () => tlId = undefined
  });
}

const closeMacro = (root: Element, shadow:Element) => {
  if (tlId !== undefined) {
    tlId.kill();
  }

  tlId = gsap
  .timeline()
  .to(root, {
    y: 0,
    ease: Expo.easeOut,
    duration: DURATION,
  })
  .to(shadow, {
    opacity: 0,
    ease: Expo.easeOut,
    duration: 0.3
  }, "-=1")
  .set(shadow, {
    opacity: 0,
    display: "none",
    onComplete: () => tlId = undefined
  });
}

@customElement("view-group-list")
class GroupList extends ViewCore {
  static styles = unsafeCSS(styles);

  @property({ type: Array })
  groups?: Array<TGroup>;

  @query("#group-list")
  root: HTMLElement;
  
  @query(".shadow")
  shadow: HTMLElement;

  @query(".list ul")
  groupListUl: Element;

  constructor() {
    super();

    this.addEventListener("fold", () => {
      closeMacro(this.root, this.shadow);
    })
  }

  fireAddNewGroupEvent(e: MouseEvent) {
    const target = e.currentTarget as Element;
    const eventType = target.className;

    this.dispatchEvent(new CustomEvent(eventType));
  }

   fireRemoveGroupEvent(e: MouseEvent) {
    e.stopPropagation();
    
    const target = e.currentTarget as Element;
    const groupId = target.id.split("-")[1];

    this.dispatchEvent(
      new CustomEvent("removeGroup", {
        detail: groupId,
      })
    );
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

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    const container = this.root.querySelector(".container");
    const maxHeight = container!.clientHeight;
    const root = this.root;
    const shadow = this.shadow;
    const d = maxHeight / 5;

    Draggable.create(root, {
      zIndexBoost: false,
      type: "y",
      bounds: {
        minY: 0,
        maxY: maxHeight,
      },
      onDragEnd: function () {
        const direction = this.getDirection();
        
        if (direction === 'down') {
          if (this.y >= d) {
            openMacro(root, shadow, maxHeight);
          }
          else {
            closeMacro(root, shadow);
          }
        } 
        else if (direction === 'up'){
          if (this.y <= d * 4) {
            closeMacro(root, shadow);
          }
          else {
            openMacro(root, shadow, maxHeight);
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
      zIndexBoost: false,
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

  openListener() {
    const container = this.root.querySelector(".container");
    const maxHeight = container!.clientHeight;
    const dragInstance = Draggable.get(this.root);

    if (dragInstance) {
      if (dragInstance.y >= maxHeight - 5) {
        closeMacro(this.root, this.shadow);
      }
      else if (0 <= dragInstance.y && dragInstance.y < maxHeight - 5){
        openMacro(this.root, this.shadow, maxHeight);
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
      <section id="group-list">
        <div @click=${this.openListener} class="drag-button">
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
                <h3 style="color: #fff">${this.langJson.main.all}</h3>
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

                    ${group.name !== "etc" ? html`
                      <div class="remove-btn" 
                        id=${`groupRemove-${group.name}`}
                        @click=${this.fireRemoveGroupEvent}>
                        <component-svg
                            .width=${22}
                            .height=${22}
                            .fill=${"inherit"}
                            .data=${CloseSVG}
                          ></component-svg>
                      </div>
                    `: ""}
                  </li>
                `
              )}
  
              <li @click=${this.changeGroup} id="group-etc">
                <div style="background-color: ${etc!.color}" class="box"></div>
                <h3 style="color:${etc!.color}">${this.langJson.main.etc}</h3>
                <p>${etc!.channels.length} channels</p>
              </li>
            </ul>
            <div @click=${this.fireAddNewGroupEvent} class="addNewGroup">
              <component-svg
              .width=${24}
              .fill=${"inherit"}
              .data=${PlusSVG}></component-svg>
            </div>
          </div>
        </div>
      </section>

      <div class="shadow"></div>

      <div class="back"></div>
    `;
  }
}
