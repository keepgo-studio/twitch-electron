import { assign, createMachine, send, spawn } from "xstate";
import { sendTo } from "xstate/lib/actions";

/**
 * 유저가 도저히 authorization 안 될 때가 있을까?
 * 아직 그런 이유는 찾지를 못 해서 따로 handling 하지 않는다
 */

const FbaseAuthMachine =  createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QDMBGBDWZ0FcAuAFgHQCWEANmAMQBOkJdAxngAS6ED2NJAXuniQ4A7ANoAGALqJQABw6wSA4dJAAPRACYNATiIBGAOx6AHMb16ArBr0aALKYA0IAJ6IzRW9q-aAbGLEGWhbGPgC+oU5omNj4xGSUVIwcALYylHhgbLHiUkggcgpKQirqCLblRADMGma2PrYBtgY+PhZOrggmekTaFpU2PpXalWbGYhbhkRhY7HEU1IwEYIwA1ixJQkLLRTkqBYqCxXmldpX69QHVYpUGI+Xtmu7j5qYaYoM+GuERIEIcEHAVFEZrE9vIDspjoguvojKZzFYbPZjA8EABaHxEfz+PS2SrVAzGSpiOyTEDAmKEUjzMGFQ4lTTaWxEAwWHFiWwaAzvCxM1EmDQePp6DlNAI6JpkimzIgZGjJEhCfhgWkQo6gUo+cws3zacb+AzacwGfnuN7E4ZjC54yrfUJAA */
  id: "fbaseauth",

  predictableActionArguments: true,
  tsTypes: {} as import("./App.state.typegen").Typegen0,

  schema: {
    events: {} as
    | { type: "redirect authorization" }
    | { type: "complete auth" }
    | { type: "check connection" }
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
    },
    "update connection": () => {
      console.log("connection from idle")
    }
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
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqB0sAuyBO2AxNgPYDWYAdgAQCWsA2gAwC6ioqJst2tJl7EAA9EAZgBsAJgySmogIwBWABwAWZfIDsqxaIA0IAJ6ItmjPNWjJE5Zvnj785QF9nBtJhz4ipCjXoM8mxIIJzcvPyCIggS0rIKKupaOvpGYopmmnLyCeJMTqpyru7oWLgEhHhgAI4ArnDY1ADGABZgTWS0lFDUtbBgeACSlABmJNSk1ADuJHgUeMzBHFw8fAIh0aqSBsYIGhiKTEdyAJyq4gqSJ5rFIB4YIwBGyP0AgrXYLYQQ-GAYXQA3ch-J4vMDID4tRaCMKrSIbRCaKQYUQSI6SbTKUSWZQ7EwnUQYTSScQZNSKVSqE6KeS3e6gt6QwhNfiUdoRSjQkKwjlRRCKAkYZRMVTaYmSHTXTR4hAnJgYE6KxVo0RMMniOmlAA2JCgMAgdEolRq9Rw1AgyFwE3GMzmAy5y3Caz5ss0ihkmlENNE1PkaqY0rSsuUCskTmUtnySgpmswOr1kENhBGtDwZpZAFtUFqwNgwA7QiteQiEPJ5NchWimOI3VScuIZU4TkK3UxJBijti8pJY-8IDnmTr+gWec6SxYMiiaxORaKsooZe33cpJBoJLofcLNDdbpQSBA4IIPDCi2PQNEALQNoNXjDHe8Po47kqecrYE9O+HnxAneQHTRroqOgZAojYrhgKT1u2Wx+jGbh3KUDJgO8nwfnC6zfggAriHeCgKASVh+pIC5BuWf7UpcKjCtSFKqL28b6oaaHFphRE4UwBIaJYNKHA4i4kiiq71huJxbs+CGYLQ-ZgMxZ7CCYoielOdgrtS1xMLiQbtjhVhrqSqKiQG4n3HmeAZl0loydyp5fvJpaKAK5jUu2AEkucUj8e6AZcVkqjyB2pKuK4QA */
  id: "app",

  predictableActionArguments: true,
  tsTypes: {} as import("./App.state.typegen").Typegen1 ,

  schema: {
    events: {} as
      | { type: "request checking userInfo to worker" }
      | { type: "token is"; isValid: boolean }
      | { type: "request data to worker"}
      | { type: "connection"}
      | { type: "first complete"}
      | { type: "close"}
      | { type: "done.fbaseauth.fbaseauth" }
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
          internal: true,
          actions: "request userInfo"
        }
      }
    },

    fbaseAuth: {
      invoke: {
        id: "fbaseauth",
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