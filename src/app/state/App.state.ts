import { createMachine } from "xstate";

/**
 * 유저가 도저히 authorization 안 될 때가 있을까?
 * 아직 그런 이유는 찾지를 못 해서 따로 handling 하지 않는다
 */

const FbaseAuthMachine =  createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QDMCGsyoK4BcAWAxAKIBuYAdjgAQCMA2gAwC6ioADgPawCWO3H5ViAAeiGgGYA7ADpJc8QBYpAVgA0IAJ5iGADlk6aAJmUBfM+vIcIcIWgzZ8Qzjz4ChohAFodMgJzjxZX9JNU1EQxppQwNjcxA7TFw8aQAbDlQIbnIoJy5efkEkEURPcV9pf0Dg0K0EGl9In1MTdQSHZPIwAHcqWBxUHDBaXJcC9zF66RoQyRiasQbpJrMzIA */
  id: "fbaseauth",
  predictableActionArguments: true,
  tsTypes: {} as import("./App.state.typegen.d.ts").Typegen0,
  states: {
    loading: {},
    "new state 1": {}
  },

  initial: "loading",

  on: {
    "Event 1": ".new state 1"
  }
});

/**
 * loading state 일 때 skeleton html보여지게하자
 * 
 * logged in 상태에서도 skeleton이 유지되어 있고 api call들이 모두 성공하고 나서 skeleton 삭제
 * 
 * request group data가 만일 엄청 커진다면 라는 사항은 아직 고려하지 않음(2023/May)
 * 이유는 그렇게 json 데이터가 크지 않을거 같음 (나중에 생각)
 */
export const AppMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqB0sAuyBO2AxNgPYDWYAdgAQCWsA2gAwC6ioqJst2tJl7EAA9EAZgBsAJgySmogIwAWeUwDs4xaoAc8gDQgAnonnjVGDaMnimATnlatkkwFYAvq-1pMOfEVIUaegZ5NiQQTm5efkERBAlpWQVlNQ1tPUMxRS0ZOXlVUUtJZytRVXdPdCxcAkI8MABHAFc4bGoAYwALMDayWkooakbYMDwASUoAMxJqUmoAdxI8CjxmUI4uHj4BMNjlDBsDw6PD8X0jBHkrDHl5G0dHURtRZRtykC8MCYAjZGGAQUa2A6hAg-DAGD6ADdyODvr8wACgatBBFNtEdoh1NICs4bM51JorOItGdjFpFDIrM4tKomFImFYtG4PO9KnD-oDgW1+JRulFKMiwqj+TFELjRBgtExNGpcfJnPjJKSEDoMIpDuTFEwbgdlG8PgAbEhQGAQOiUWoNZo4agQZC4GbTBZLEaC9aRLaihA2VTOGT5RTiS6SRSiJk2ZVaGxqpw2bWmRSSVSKfH6ypGk2Qc2ECa0PA27kAW1QBrA2DAbvCGxFGIutzMWlEuM12i01iVGQuUowpWcTD7VkDkkk5LTmFoEFLhDaRuGleFntrSnxPdMsayTj7imVTnEPZHJm1Wp9TK07hZlBIEDggi8KOri9AsQAtHumO+P5+P6Hlc+-ccAMOUQxyqXx7w9dEn0QOwMGpXFlDDQMg3xZV7HkcxbkccQ8VUONTBA9kEU5cC0W2KCEFxN8FEZfsChpdJznsaQUySbD4NENQyhZQ1jVNc0SJrciVCuWxSlUJQfWHXCdxMSUD2sJRbG0akQInUsBMfYRjFKCUJFUIpqRsZRJFKGS93uQ9FJPFTuMqcs8ELPp7TADTIK0i4FWjW5nAUcR8VlDQZL9fEdHEDjHkeO4uPcIA */
  id: "app",

  predictableActionArguments: true,
  tsTypes: {} as import("./App.state.typegen.d.ts").Typegen1,

  schema: {
    events: {} as
      | { type: "request checking userInfo to worker" }
      | { type: "token is"}
      | { type: "request data to worker"}
      | { type: "connection"}
      | { type: "first complete"}
      | { type: "close"},
  },

  states: {
    start: {
      entry: "create skeleton",

      on: {
        "token is": [{
          target: "fbaseAuth",
          cond: "unvalid",
          actions: "create fbase auth view"
        }, {
          target: "logged in",
          cond: "valid"
        }],

        "request checking userInfo to worker": {
          target: "start",
          internal: true
        }
      }
    },

    fbaseAuth: {
      invoke: {
        id: "fbaseAuth",
        src: FbaseAuthMachine,
        onDone: {
          target: "logged in",
          actions: "remove fbase auth view"
        }
      },

      on: {
        connection: {
          target: "fbaseAuth",
          internal: true,
          actions: "send connected"
        }
      }
    },

    "logged in": {
      on: {
        "request data to worker": {
          target: "logged in",
          actions: ["request data", "change skeleton ui"],
        },
        "first complete": {
          target: "idle",
          actions: ["remove skeleton", "create ui"]
        }
      }
    },

    idle: {
      on: {
        close: "terminate"
      }
    },

    terminate: {
      type: "final"
    }
  },

  initial: "start"
});