import { addWorkerListener } from "@utils/message";
import { AppTag } from "@views/App";
import { gsap } from "gsap";
import { CSSPlugin } from "gsap/CSSPlugin" 

import "@components/Alarm"
import "@components/Dialog"
import "@components/Loading"
import "@components/SVG"

function main () {    
  window.worker = new Worker("/app/worker.js");

  const app = document.createElement(AppTag);

  addWorkerListener((e) => {
    if (e.data.type === "worker-has-start")
      document.body.append(app);
  })

  gsap.registerPlugin(CSSPlugin);
}

main();