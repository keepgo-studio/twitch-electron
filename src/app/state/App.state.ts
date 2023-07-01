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
| { type: "user choosed"; profile?: TProfile }
| { type: "token is"; isValid: boolean }
| { type: 'done.invoke.fbaseauth', data: { userInfo: TUserInfo } }
| { type: "connection" }
| { type: "first complete" }
| { type: "back to profile"}
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
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqB0sAuyBO2AxNgPYDWYAdgAQCWsA2gAwC6ioqJst2tJl7EAA9EANgAcATgxNRAJgCsc8QEZJTBSoDMWgDQgAnoi0B2aSbmiFAFiYrrW8QtEmTAXzf60mHPiKkKGnoGFTYkEE5uXn5BEQQVOQcMBIUmORNreXEXfSMERzkMOSYtJklUrRVxLQVJDy90DAAzACNkWDAAQQBXbAALQgh+MAxaSgA3chHW9rBkXr7mMI4uHj4BcLi5SxkTVSYTbVFRLXSFXMRVDGtJW-FrcTSS4+t6kG9mto6e-sIwPDwJDwGFQABtkNgmkCALafWbzfpLQSRNYxTaIbaiXb7Q5aY6nEznQwY0QqIolBIacRySROY5vD4zb4LQgAY34lDArOilCR4RRPNiiGs1gwri01mK6WpTCeoguCEU4gwpgqChM8gUWoyDMaoJIUBgEDolEITVoeBw1HZ0LBYGwYD5Kyi6yF8RMZXJlTueNSkoVEqYMlq4hMplDezqnnejVoEFBYDZ+o6Toiq0F6MVKhKYpKNOqIdpemJ+WsChkeIcCkc92yLl1mDjCcIbVZZGopGoqEB5oTqYFrszKg90mK3qLViY-pLKhsGGykg1J0s9ge4gbGAA7sgeIRuh08Na+iQuJB++nB6A4hJpLJFMo1BptMW8mcMKTFycy8pxE4PNHKBICA4EEbxkQvNEr0QABaLQiksdVFzkYdbjMac8mgrFZVlB5Mg0URZBqDdfAIcCXUg4REHUcsUg0Wx0lnEoA0yL0yj2SoCTLDcmS6BYyNRDYoIQawTADWoVQfBJQxUYd1Q3fVDUgE1+IzIT7A1DBykqMxtjYpQAx2PZRDLB5V0JFQNybMAVMvSj4lDLF7AOGlyiJPJSlvSsFGqFcdHXaMPgdPBoTGCFrP5CDBLs3Ty2rbRF1lJw1GsZjRWUYzREkSUtEkKoFA3bceBsii4hFUU7GcMs0MkbY5AVOQ8VzSo71cssp3-NwgA */
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
      on: {
        "token is": [{
          target: "fbaseAuth",
          cond: "unvalid",
          actions: "create fbase auth view"
        }, {
          target: "logged in",
          cond: "valid"
        }]
      },

      entry: "get choosed user info from worker",
      exit: "remove profile view"
    },

    fbaseAuth: {
      invoke: {
        id: APP_CHILD_ID,
        src: FbaseAuthMachine,

        onDone: {
          target: "logged in",
          actions: ["remove fbase auth view", "get user info from auth"]
        },

        onError: "wait"
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
        close: "terminate",
        "back to profile": "wait"
      },

      entry: ["remove skeleton", "create ui"],
      exit: "remove ui"
    },

    terminate: {
      type: "final"
    },

    wait: {
      on: {
        "user choosed": "start"
      },

      entry: ["create profile view"]
    }
  },
  initial: "wait"
});