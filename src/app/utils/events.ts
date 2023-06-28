type WorkerPostEvents = 
  | "worker-has-start"
  | "return-profiles"
  | "return-userinfo"
  | "result-token-validation"
  | "after-open-user-db"
  | "sync-complete-followed-list"
  | "return-followed-list"
  | "return-group-list"
  | "return-stream-channels"
  // MainView
  | "result-add-new-group"
  | "result-save-aot"
  | "result-changing-group-name"
  | "result-changing-group-color"
  // Group
  | "result-remove-channel-from-group"
  // AddChannels
  | "result-change-channels-group"
  ;

type AppPostEvents =
  | "get-userinfo-by-name"
  | "sync-userinfo"
  | "check-access-token-valid"
  | "sync-followed-list"
  | "get-followed-list"
  | "get-group-list"
  | "get-stream-list"
  ;

type AuthPostEvents = 
  | "open-user-db-to-worker"
  ;

type ProfilePostEvents = 
  | "get-profiles"
  ;
type MainPostEvents =
  | "append-new-group"
  | "save-aot-result"
  | "change-group-name"
  | "change-group-color"
  ;

type GroupPostEvents =
  | "remove-channel-from-grpup"
  ;

type AddChannelsPostEvents = 
  | "change-channels-group"
  ;

export type {
  ProfilePostEvents,
  WorkerPostEvents,
  AuthPostEvents,
  MainPostEvents,
  AddChannelsPostEvents,
  GroupPostEvents,
  AppPostEvents
}