import { AppTag } from "@views/App";

function init() {
  window.background = new Worker("/app/worker.js");

  
}

function main () {
  init();

  const main = document.getElementById('root')!;

  main.append(document.createElement(AppTag));
}

main();