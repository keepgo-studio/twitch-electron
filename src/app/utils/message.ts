import type {
  AddChannelsPostEvents,
  AppPostEvents,
  AuthPostEvents,
  GroupPostEvents,
  MainPostEvents,
  ProfilePostEvents,
  WorkerPostEvents,
} from "@utils/events";

export function sendToWorker(
  form: WebMessageForm<
    ProfilePostEvents 
    | AppPostEvents 
    | AuthPostEvents 
    | MainPostEvents 
    | AddChannelsPostEvents
    | GroupPostEvents
  >
) {
  if (window.worker === undefined)
    throw new Error("worker is terminate for some reason, refresh the app");

  window.worker.postMessage(form);
}

export function addWorkerListener(
  listener: (e: MessageEvent<WebMessageForm<WorkerPostEvents>>) => void
) {
  window.worker.addEventListener("message", listener);
}

export function removeWorkerListener(
  listener: (e: MessageEvent<WebMessageForm<WorkerPostEvents>>) => void
) {
  window.worker.removeEventListener("message", listener);
}
