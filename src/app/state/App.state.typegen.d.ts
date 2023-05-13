
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
          
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          
        };
        eventsCausingServices: {
          
        };
        matchesStates: "loading" | "new state 1";
        tags: never;
      }

export interface Typegen1 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.fbaseAuth": { type: "done.invoke.fbaseAuth"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          
        };
        missingImplementations: {
          actions: "change skeleton ui" | "create fbase auth view" | "create skeleton" | "create ui" | "remove fbase auth view" | "remove skeleton" | "request data" | "send connected";
          delays: never;
          guards: "unvalid" | "valid";
          services: never;
        };
        eventsCausingActions: {
          "change skeleton ui": "request data to worker";
"create fbase auth view": "token is";
"create skeleton": "request checking userInfo to worker" | "xstate.init";
"create ui": "first complete";
"remove fbase auth view": "done.invoke.fbaseAuth";
"remove skeleton": "first complete";
"request data": "request data to worker";
"send connected": "connection";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "unvalid": "token is";
"valid": "token is";
        };
        eventsCausingServices: {
          "fbaseAuth": "connection" | "token is";
        };
        matchesStates: "fbaseAuth" | "idle" | "logged in" | "start" | "terminate";
        tags: never;
      }
  