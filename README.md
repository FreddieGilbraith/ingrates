# Ingrates

> An isomorphic actor system

![minzipped size](https://badgen.net/bundlephobia/minzip/@little-bonsai/ingrates)
![version](https://badgen.net/npm/v/@little-bonsai/ingrates)
![license](https://badgen.net/npm/license/@little-bonsai/ingrates)

---

`ingrates` is an actor system based on [async](async) [generators](generators). I provides a very small API surface area and tries to remain relatively out of your way.

You can find docs at [ingrates.littlebonsai.co.uk](https://ingrates.littlebonsai.co.uk)

## Example

```javascript
import createActorSystem from "@little-bonsai/ingrates";

async function* ChildActor({ parent, dispatch }, firstname, lastname) {
  const msg = yield;

  if (msg.type === "HELLO") {
    dispatch(msg.src, {
      type: "GOODBYE",
      msg: \`say goodbye to \${firstname} \${lastname}\`,
    });
  }
}

async function* RootActor({ spawn, self, dispatch }) {
  const myChild = spawn(ChildActor, "Bert", "Jurnegen");

  dispatch(myChild, { type: "HELLO" });

  while (true) {
    const msg = yield;
    if (msg.type === "GOODBYE") {
      console.log("Please... my son. He's very sick");
    }
  }
}


createActorSystem()(RootActor);
```

[async]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
[generators]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/GeneratorA
