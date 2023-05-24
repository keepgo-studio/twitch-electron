
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
        };
        invokeSrcNameMap: {
          
        };
        missingImplementations: {
          actions: "change skeleton ui" | "create fbase auth view" | "create skeleton" | "create ui" | "get saved data" | "remove fbase auth view" | "remove skeleton" | "request data" | "request userInfo" | "send connected";
          delays: never;
          guards: "unvalid" | "valid";
          services: never;
        };
        eventsCausingActions: {
          "change skeleton ui": "done.invoke.fbaseauth" | "token is";
"create fbase auth view": "token is";
"create skeleton": "request checking userInfo to worker" | "xstate.init";
"create ui": "first complete";
"get saved data": "first complete";
"remove fbase auth view": "done.invoke.fbaseauth";
"remove skeleton": "first complete";
"request data": "done.invoke.fbaseauth" | "token is";
"request userInfo": "request checking userInfo to worker";
"send connected": "connection";
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
        matchesStates: "fbaseAuth" | "idle" | "logged in" | "start" | "terminate";
        tags: never;
      }
  