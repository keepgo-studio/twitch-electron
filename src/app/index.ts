import { addWorkerListener } from "@utils/message";
import { AppTag } from "@views/App";
import { gsap } from "gsap";
import { CSSPlugin } from "gsap/CSSPlugin" 
import { Draggable } from "gsap/Draggable";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "@components/Alarm"
import "@components/Dialog"
import "@components/Loading"
import "@components/SVG"

async function main () {
  const setLang = await fetch('http://ip-api.com/json')
  .then((r) => r.json())
  .then((payload) => {
    if (payload.countryCode === "KR")
      return 'ko'
    else 
      return 'en'
  })
  .catch(() => 'en');

  document.documentElement.setAttribute("lang",setLang);

  window.worker = new Worker("/app/worker.js");

  const app = document.createElement(AppTag);

  addWorkerListener((e) => {
    if (e.data.type === "worker-has-start")
      document.body.append(app);
  })

  gsap.registerPlugin(CSSPlugin, Draggable, ScrollTrigger);
}

main();