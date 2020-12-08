# Ingrates

> An isomorphic actor system

![minzipped size](https://badgen.net/bundlephobia/minzip/@little-bonsai/ingrates)
![version](https://badgen.net/npm/v/@little-bonsai/ingrates)
![license](https://badgen.net/npm/license/@little-bonsai/ingrates)

---

`ingrates` is an actor system based on [async][async] [generators][generators]. I provides a very small API surface area and tries to remain relatively out of your way.

`ingrates` borrows heavily from [nact](nact), but uses plain strings as addresses. This makes it easier to break your actor system up across workers/threads/processes/devices and transmit messages between them.

It is very much WIP, and has no real world usage. I also don't know much about formal actor systems, so this might be missing some key functionality that you really want; please get in touch if so.

## Example

```javascript
import createActorSystem from "@little-bonsai/ingrates";

async function* childActor({ parent, dispatch }, firstname, lastname) {
  while (true) {
    const msg = yield;

    if (msg.type === "HELLO") {
      dispatch(msg.src, {
        type: "GOODBYE",
        msg: `say goodbye to ${firstname} ${lastname}`,
      });
    }
  }
}

async function* rootActor({ spawn, self, dispatch }) {
  const myChild = spawn(childActor, "Bert", "Jurnegen");

  dispatch(myChild, { type: "HELLO" });

  while (true) {
    const msg = yield;
    if (msg.type === "GOODBYE") {
      console.log("Please... my son. He's very sick");
    }
  }
}

createActorSystem()(rootActor);
```

## Docs

There's no docs yet, please refer to the [tests](tests) to get an overview of the api.

## Tests

All functionality starts with [tests](tests), please have a look through to get an overview of the api.

## Todo

- [ ] handling logic for orphaned actors

[async]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction
[generators]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*
[nact]: https://nact.io/
[tests]: /test
