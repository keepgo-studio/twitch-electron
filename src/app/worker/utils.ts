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

export function parseUrl(url: string, params: Array<{
  key: string,
  val: string
}>) {
  const urlObj = new URL(url);

  params.forEach(_p => urlObj.searchParams.append(_p.key, _p.val));

  return urlObj.href;
}