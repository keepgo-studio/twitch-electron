import { assign, createMachine } from "xstate";

/**
 * 유저가 도저히 authorization 안 될 때가 있을까?
 * 아직 그런 이유는 찾지를 못 해서 따로 handling 하지 않는다
 */
export type FbaseAuthEvents = 
| { type: "redirect authorization" }
| { type: "complete auth"; userInfo: TUserInfo }
| { type: "check connection" }
;

const FbaseAuthMachine =  createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QDMBGBDWZ0FcAuAFgHQCWEANmAMQBOkJdAxngAS6ED2NJAXuniQ4A7ANoAGALqJQABw6wSA4dJAAPRACYNATiIBGAOx6AHMb16ArBr0aALKYA0IAJ6IzRW9q-aAbGLEGWhbGPgC+oU5omNj4xGSUVIwcALYylHhgbLHiUkggcgpKQirqCLblRADMGma2PrYBtgY+PhZOrggmekTaFpU2PpXalWbGYhbhkRhY7HEU1IwEYIwA1ixJQkLLRTkqBYqCxXmldpX69QHVYpUGI+Xtmu7j5qYaYoM+GuERIEIcEHAVFEZrE9vIDspjoguvojKZzFYbPZjA8EABaCw9bxmDQGbTGfHVPSTEDAmKEUjzMGFQ4lTTaWxEAwWfx6MS2XHvCwM1EmDQePps8oGAI6JoksmzIgZGjJEhCfhgakQo6gUo+cxM3zacb+PHmAy89xvSpiYZjC62SqVb6hIA */
  id: "fbaseauth",

  predictableActionArguments: true,
  tsTypes: {} as import("./App.state.typegen").Typegen0,

  schema: {
    events: {} as FbaseAuthEvents,
    context: {} as {
      userInfo?: TUserInfo
    }
  },
  
  context: {
    userInfo: undefined
  },

  states: {
    idle: {
      on: {
        "redirect authorization": {
          target: "idle",
          internal: true,
          actions: "open web page"
        },

        "complete auth": {
          target: "terminate",
          actions: "update name"
        },

        "check connection": {
          target: "idle",
          actions: "update connection",
          internal: true
        }
      }
    },

    terminate: {
      type: "final",
      data: (context, _) => ({
        userInfo: context.userInfo
      })
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
    },
    "update name": assign({
      userInfo: (context, event) => event.userInfo
    }) 
  }
});


export const APP_CHILD_ID = "fbaseauth";

export type AppContext = {};

export type AppEvents = 
| { type: "user choosed"; name: string | undefined }
| { type: "token is"; isValid: boolean }
| { type: 'done.invoke.fbaseauth', data: { userInfo: TUserInfo } }
| { type: "connection" }
| { type: "first complete" }
| { type: "close" };

/**
 * loading state 일 때 skeleton html보여지게하자
 * 
 * logged in 상태에서도 skeleton이 유지되어 있고 api call들이 모두 성공하고 나서 skeleton 삭제
 * 
 * request group data가 만일 엄청 커진다면 라는 사항은 아직 고려하지 않음(2023/May)
 * 이유는 그렇게 json 데이터가 크지 않을거 같음 (나중에 생각)
 */
export const AppMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqB0sAuyBO2AxNgPYDWYAdgAQCWsA2gAwC6ioqJst2tJl7EAA9EAdgAcARgwA2AKwyATE3EBOVQBZJUjQBoQAT0SSZo2RoDMi1eKWTRFx4oC+z-Wkw58RUhRr0GSTYkEE5uXn5BEQQJaXklFXUtHX0jBAsZJlkFCyZFOVVTcVFVV3d0DAAzACNkWDAAQQBXbAALQgh+MAxaSgA3cm6aurBkFtbmYI4uHj4BEOjJbWkJVSY5FRkLDVE5UVTjUWkmE6ZJDRkTRUULOTKQDyra+ua2wgBjfkowd4jKScEYVmkQWxjOFgw+Qke2K4iYDgsBwQUgwGxOVi2ii28PujwANiQoDAIHRKIRKrQ8DhqJ8ALaoPFgbBgAEhIF-KLGLbSVSiGQaDRqawlbRI5SKDDnKw7XJKfnFXEVWgQRkfAn1VnTcJzTkIcVyWRnDbiXL2JgyMWKDQYWw2W63JYyVQWRWYADuyB4hCa9TwNNaJC4kE1oRmHNBevEEqYF2KikkTAsDhkWzFMdkkjtGjk4jk1zyd3ulBIEDggg8gLDOojAFoLYZEDWDeoW622y63A8Kl4CJXtSDQNEBRD4vGJJc1CakcsM3abs6nBoXJ3HsMXuM+8D5oOwZIDYLLKJRCpzuIo9OoxhsxYTOJBTn1HINK6MASiZBSZvwzuEJILOoMFELEBWUFQFHOC9xBtJ0pFyDRCiYVRC3KTBlUZL9qx-ewbAwRM1HkGwLkzes0m0KDbRNZRcz3RxxBfZk8FpXpkGZDCB2ERB40UMwlyQ3YTi2ApxEta0ll5Gxbz2ICOxQjAPR4Njtw4hAl2nGQoMuGx4yQqNBXOVxXCAA */
  id: "app",

  predictableActionArguments: true,
  tsTypes: {} as import("./App.state.typegen").Typegen1,

  schema: {
    events: {} as AppEvents,
    context: {} as AppContext
  },

  context: {},

  states: {
    start: {
      entry: ["get choosed user info from worker"],

      on: {
        "token is": [{
          target: "fbaseAuth",
          cond: "unvalid",
          actions: "create fbase auth view"
        }, {
          target: "logged in",
          cond: "valid"
        }]
      }
    },

    fbaseAuth: {
      invoke: {
        id: APP_CHILD_ID,
        src: FbaseAuthMachine,
        onDone: {
          target: "logged in",
          actions: ["remove fbase auth view", "get user info from auth"]
        },
      },

      on: {
        connection: {
          target: "fbaseAuth",
          internal: true,
          actions: "send connected"
        }
      },
    },

    "logged in": {
      on: {
        "first complete": {
          target: "idle",
          actions: "get saved data"
        }
      },

      entry: ["sync followed list", "create skeleton"]
    },

    idle: {
      on: {
        close: "terminate"
      },

      entry: ["remove skeleton", "create ui"]
    },

    terminate: {
      type: "final"
    },

    wait: {
      on: {
        "user choosed": "start"
      },

      entry: ["create profile view"],
      exit: "remove profile view"
    }
  },
  initial: "wait"
});