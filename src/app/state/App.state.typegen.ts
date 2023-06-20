
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "open web page": "redirect authorization";
"update connection": "check connection";
"update name": "complete auth";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          
        };
        eventsCausingServices: {
          
        };
        matchesStates: "idle" | "terminate";
        tags: never;
      }

export interface Typegen1 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.fbaseauth": { type: "done.invoke.fbaseauth"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"xstate.init": { type: "xstate.init" };
"xstate.stop": { type: "xstate.stop" };
        };
        invokeSrcNameMap: {
          
        };
        missingImplementations: {
          actions: "create fbase auth view" | "create profile view" | "create skeleton" | "create ui" | "get choosed user info from worker" | "get saved data" | "get user info from auth" | "remove fbase auth view" | "remove profile view" | "remove skeleton" | "send connected" | "sync followed list";
          delays: never;
          guards: "unvalid" | "valid";
          services: never;
        };
        eventsCausingActions: {
          "create fbase auth view": "token is";
"create profile view": "xstate.init";
"create skeleton": "done.invoke.fbaseauth" | "token is";
"create ui": "first complete";
"get choosed user info from worker": "user choosed";
"get saved data": "first complete";
"get user info from auth": "done.invoke.fbaseauth";
"remove fbase auth view": "done.invoke.fbaseauth";
"remove profile view": "user choosed" | "xstate.stop";
"remove skeleton": "first complete";
"send connected": "connection";
"sync followed list": "done.invoke.fbaseauth" | "token is";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "unvalid": "token is";
"valid": "token is";
        };
        eventsCausingServices: {
          "fbaseauth": "connection" | "token is";
        };
        matchesStates: "fbaseAuth" | "idle" | "logged in" | "start" | "terminate" | "wait";
        tags: never;
      }
  