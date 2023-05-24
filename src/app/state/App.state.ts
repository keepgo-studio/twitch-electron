import { createMachine } from "xstate";

/**
 * 유저가 도저히 authorization 안 될 때가 있을까?
 * 아직 그런 이유는 찾지를 못 해서 따로 handling 하지 않는다
 */
type FbaseAuthEvents = 
| { type: "redirect authorization" }
| { type: "complete auth" }
| { type: "check connection" }

const FbaseAuthMachine =  createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QDMBGBDWZ0FcAuAFgHQCWEANmAMQBOkJdAxngAS6ED2NJAXuniQ4A7ANoAGALqJQABw6wSA4dJAAPRACYNATiIBGAOx6AHMb16ArBr0aALKYA0IAJ6IzRW9q-aAbGLEGWhbGPgC+oU5omNj4xGSUVIwcALYylHhgbLHiUkggcgpKQirqCLblRADMGma2PrYBtgY+PhZOrggmekTaFpU2PpXalWbGYhbhkRhY7HEU1IwEYIwA1ixJQkLLRTkqBYqCxXmldpX69QHVYpUGI+Xtmu7j5qYaYoM+GuERIEIcEHAVFEZrE9vIDspjoguvojKZzFYbPZjA8EABaHxEfz+PS2SrVAzGSpiOyTEDAmKEUjzMGFQ4lTTaWxEAwWHFiWwaAzvCxM1EmDQePp6DlNAI6JpkimzIgZGjJEhCfhgWkQo6gUo+cws3zacb+AzacwGfnuN7E4ZjC54yrfUJAA */
  id: "fbaseauth",

  predictableActionArguments: true,
  tsTypes: {} as import("./App.state.typegen").Typegen0,

  schema: {
    events: {} as FbaseAuthEvents
  },

  states: {
    idle: {
      on: {
        "redirect authorization": {
          target: "idle",
          internal: true,
          actions: "open web page"
        },

        "complete auth": "terminate",

        "check connection": {
          target: "idle",
          actions: "update connection",
          internal: true
        }
      }
    },

    terminate: {
      type: "final",
    }
  },

  initial: "idle"
}, {
  actions: {
    "open web page": () => {
      window.api.openBrowser("https://twitch-group.firebaseapp.com");
    // window.api.openBrowser("http://localhost:5002");
    },
    "update connection": () => {
      console.log("connection from idle")
    }
  }
});


export const APP_CHILD_ID = "fbaseauth";

type AppContext = {};

type AppEvents = 
| { type: "request checking userInfo to worker" }
| { type: "token is"; isValid: boolean }
| { type: "connection"}
| { type: "first complete"}
| { type: "close"};

/**
 * loading state 일 때 skeleton html보여지게하자
 * 
 * logged in 상태에서도 skeleton이 유지되어 있고 api call들이 모두 성공하고 나서 skeleton 삭제
 * 
 * request group data가 만일 엄청 커진다면 라는 사항은 아직 고려하지 않음(2023/May)
 * 이유는 그렇게 json 데이터가 크지 않을거 같음 (나중에 생각)
 */
export const AppMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqB0sAuyBO2AxNgPYDWYAdgAQCWsA2gAwC6ioqJst2tJl7EAA9EAZgBsAJgySmopgE4ALMqWilAGhABPRAEZxADgxKA7OICsy0YdHq9hyQF8nWtJhz4ipCjXoM9NiQQTm5efkERBElDY3FTBUtTJRT1LV0EdWlRPRtJPSYLcSUmPT0lFzd0LFwCQjwwAEcAVzhsagBjAAswDrJaSihqZtgwPABJSgAzEmpSagB3EjwKPGYgji4ePgFgqKU9DAVjk9OT8XTEQ0OLJjumSXFcgwUmCtcQdwwpgCNkUYAgs1sF1CBB+GAMAMAG7kSG-f5gZDArrrQShbYRPaIczZURWJimXIWcwXHT6QwWDCFY6SY6KAymCyGSqfaoIwEowgdfiUXrhSho4IYgWRRBWUQYQxvSzXST4yl6S4IRwYOx2Im5QqiSSmUysr4AGxIUBgEDolEIU1oeBwnRIAFtUIawNgwELNmEdmKEHpJPkjuJFExLApRKZdaJlQ4FBgmXc9MoSSVrgbqrQIC7ucbRh6QltRdjfRYdVKLBY1BWdWoFNHinHDK8FI8LHo9RZnKzKCQIHBBO50QXvUWALTian3SdTtTKkdUs6mGxGeQKctpjy1bCDr1Y0BRBQ3SnNonyKyxMkZBzSJQl8odoyWKT6j5fDlgIEg7eY3Z78WJak5P68p+rqFjRrYMiGMUphQaUCiNuI64YMapqQBaX6Fr+CDwUwMiLgc6jiAoMGEuBsamHIegltciS3MoSEZi6GHDlhuTEUci5MkohgUUUDjKv646yDkeplMRNjlEhbp4A6AzIG6zG7sI+jiDYGBBoufpEUYxymAJBxxlIxEwX6uSWO8LhAA */
  id: "app",

  predictableActionArguments: true,
  tsTypes: {} as import("./App.state.typegen").Typegen1 ,

  schema: {
    events: {} as AppEvents,
    context: {} as AppContext
  },

  context: {},

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
          internal: true,
          actions: "request userInfo"
        }
      }
    },

    fbaseAuth: {
      invoke: {
        id: APP_CHILD_ID,
        src: FbaseAuthMachine,
        onDone: {
          target: "logged in",
          actions: "remove fbase auth view"
        },
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
        "first complete": {
          target: "idle",
          actions: ["remove skeleton", "create ui"]
        }
      },

      entry: ["request data", "change skeleton ui"]
    },

    idle: {
      on: {
        close: "terminate"
      },

      entry: "get saved data"
    },

    terminate: {
      type: "final"
    }
  },
  initial: "start"
});