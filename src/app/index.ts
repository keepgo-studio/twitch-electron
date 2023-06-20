import { addWorkerListener } from "@utils/message";
import { AppTag } from "@views/App";
  
function main () {    
  window.worker = new Worker("/app/worker.js");

  const app = document.createElement(AppTag);

  addWorkerListener((e) => {
    if (e.data.type === "worker-has-start")
      document.body.append(app);
  })
}

main();