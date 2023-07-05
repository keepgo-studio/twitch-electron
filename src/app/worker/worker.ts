import DB from "./db";
import { ViewAddChannelsHandler, ViewAppHandler, ViewAuthHandler, ViewGroupHandler, ViewMainHandler, ViewProfileHandler } from "./handler";
import { sendToMainThread } from "./utils";

async function main() {
  console.log("web worker on");
  
  await DB.openProfileDB();

  new ViewAppHandler();

  new ViewAuthHandler();

  new ViewProfileHandler();

  new ViewMainHandler();

  new ViewGroupHandler();
  
  new ViewAddChannelsHandler();

  sendToMainThread({
    origin: "worker",
    type: "worker-has-start"
  });
}

main();
