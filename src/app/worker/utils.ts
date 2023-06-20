import type { 
  AppPostEvents, 
  AuthPostEvents, 
  ProfilePostEvents, 
  WorkerPostEvents 
} from "@utils/events";

export function sendToMainThread(form: WebMessageForm<WorkerPostEvents>) {
  self.postMessage(form);
}

export function addSelfListener(listener: (e: MessageEvent<WebMessageForm<
  ProfilePostEvents | AppPostEvents | AuthPostEvents
  >>) => void) {
  self.addEventListener("message", listener)
}