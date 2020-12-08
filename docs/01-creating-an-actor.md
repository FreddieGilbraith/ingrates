# Creating an Actor

In `ingrates`, an actor is an _async_ _itterator_ function. The simplest possible actor looks like this:

```javascript
async function* helloWorldActor() {
  console.log("hello world");
}
```

This function won't do anything on its own, an must be spawned using an _actor system_. _ingrates_ exports a function called `createActorSystem` that can be used to spawn actors:

```javascript
import createActorSystem from "@little-bonsai/ingrates";

async function* helloWorldActor() {
  console.log("hello world");
}

const actorSystem = createActorSystem();

actorSystem(helloWorldActor);
```

---

The ingrates actor system provides several helper functions to your actors as arguments, the four simplest are:

- `spawn(actor)`: spawns a new actor as the child of the current actor
- `dispatch(address, message)`: sends a message to an actor at a given address
- `self`: the actor's own address
- `parent`: the actor's parent's address

Actors use the `yield` keyword to receive incoming messages from other actors:

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

It's up to each actor to repeatedly `yield` more incoming messages inside a loop, or exit the loop if the actor wants to terminate.

In the previous example we also pass additional arguments when `spawn`ing a `childActor`; these are passed as parameters to `childActor`, and allow you to provide information to an actor without having to `dispatch` to it.
