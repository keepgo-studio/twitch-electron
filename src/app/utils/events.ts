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
  ;

type AppPostEvents =
  | "get-userinfo-by-name"
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

export type {
  ProfilePostEvents,
  WorkerPostEvents,
  AuthPostEvents,
  AppPostEvents
}