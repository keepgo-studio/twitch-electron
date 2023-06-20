
// type WorkerHandlingEvents =
//   | "get-user-info"
//   | "get-access-token-valid"
//   | "store-user-info"
//   | "get-followed-channels"
//   | "save-AOT"
//   | "change-group-name"
//   | "append-new-group"
//   | "get-store-group-list"
//   ;
// export type { WorkerHandlingEvents };

import DB from "./db";
import { ViewAppHandler, ViewAuthHandler, ViewProfileHandler } from "./handler";
import { sendToMainThread } from "./utils";

async function main() {
  console.log("web worker on");
  
  await DB.openProfileDB();

  new ViewAppHandler();

  new ViewAuthHandler();

  new ViewProfileHandler();

  sendToMainThread({
    origin: "worker",
    type: "worker-has-start"
  });
}

main();
