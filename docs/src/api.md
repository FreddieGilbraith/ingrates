# API

### Table of Contents

<!-- vim-markdown-toc GFM -->

* [Actor Provisions](#actor-provisions)
   * [spawn](#spawn)
   * [self](#self)
   * [parent](#parent)
   * [dispatch](#dispatch)
      * [src](#src)
   * [state](#state)
* [createActorSystem](#createactorsystem)
   * [transports](#transports)
   * [enhancers](#enhancers)
   * [realizers](#realizers)

<!-- vim-markdown-toc -->

## Actor Provisions

The first argument of every actor is its `provisions`. This is an object containing all the properties and functions that ingrates provide to enable your generator function to act as an actor.

There are several default provisions detailed below, that come built-in to ingrates, but it's easy to write your own, and inject them into every actor using an [enhancer][#enhancers]

### spawn

> `(actorGenerator, ...actorArgs) => address`

A function used to spawn new actors.

The first argument should be the generator that you want to sport as an actor, and following arguments will be passed through to the child actor

```javascript
function* Parent({ spawn }) {
  spawn(Child);
  spawn(Child, "Jane Roe");
}

function* Child(provisions, name = "John Doe") {
  console.log(name);
}

// output:
// "John Doe"
// "Jane Roe"
```

### self

The id of the current actor

```javascript
function* Parent({ spawn }) {
  const childId = spawn(Child);
  console.log(childId);
}

function* Child({ self }) {
  console.log(self);
}

// output:
// "LzMuGqSgjR9sIcePQb5kQQHA"
// "LzMuGqSgjR9sIcePQb5kQQHA"
```

### parent

The id of the parent that spawned this actor

```javascript
function* Parent({ spawn, self }) {
  const childId = spawn(Child);
  console.log(self);
}

function* Child({ self, parent }) {
  console.log(parent);
}

// output:
// "kOksJglNhIRRsr4S2j6opH4N"
// "kOksJglNhIRRsr4S2j6opH4N"
```

### dispatch

> `(address, message) => void`

The `dispatch` function is used to send messages to other actors. Actors can receive incoming messages using the `yield` keyword.

```javascript
function* Parent({ spawn, dispatch }) {
  const childAddr = spawn(Child);
  dispatch(childAddr, {
    greeting: "hello",
  });
}

function* Child() {
  const msg = yield;
  console.log(msg.greeting, "world");
}

// output:
// "hello world"
```

#### src

`dispatch` will automatically add the property `src` (short for "source") to every message, so that an actor knows where to send their reply

```javascript
function* Parent({ spawn, dispatch }) {
  const childAddr = spawn(Child);
  dispatch(childAddr, {
    greeting: "hello",
  });
  const { greeting } = yield;
  console.log(greeting);
}

function* Child({ dispatch }) {
  const { greeting, src } = yield;
  dispatch(src, {
    greeting: "hello to you too",
  });
}

// output:
// "hello to you too"
```

But an actor can also supply a custom `src` property, if it would like the response to go to a different actor;

```javascript
function* Parent({ spawn, dispatch }) {
  const childAddr = spawn(Child);
  const secretaryAddr = spawn(Secretary);

  dispatch(childAddr, {
    greeting: "hello",
    src: secretaryAddr,
  });
}

function* Child({ dispatch }) {
  const { greeting, src } = yield;
  dispatch(src, {
    greeting: "hello to you too",
  });
}

function* Secretary() {
  const { greeting } = yield;
  console.log("Secretary recieved", greeting);
}

// output:
// "Secretary recieved hello to you too"
```

### state

`state` is a container that an actor can use to persist data outside of the actor system. It can contain any type of data, and is fully encapsulated to a single actor instance. An actor should set a default value for their state, and is then free to mutate it throughout its lifecycle. The updated state should be `yield`ed out from the actor, so that it can be saved.

```javascript
function* StatefulActor({
  state = {
    numberOfMessagesRecieved: 0,
  },
}) {
  while (true) {
    const msg = yield state;
    state.numberOfMessagesRecieved += 1;
  }
}
```

The state provision will not do anything unless your actor system has a [realizer](#realizers) that will persist the yielded state to some sort of storage system (eg. disk, localStorage, mongoDB, indexedDB).

State can be a bit hard to understand, so it's recomended that you read through the [state section of the guide](/guide)

## createActorSystem

### transports

> `( ({snk, msg, src }) => void ) => msg => bool`

Transports are used to connect an actor system to the outside world, they provide a way for actors to transparently send and receive messages from outside their own actor system.

Transports are called at startup, with version of the `dispatch` function that **will not** automatically set the `src` property.

Transports return a handler function, that will return false if the transport was unable to handle the message, and true if the transport will handle the message

```javascript
// This transport will send messages too and from addresses that end with "@remoteService"
// Any actors in this system don't need to know that this service might exist on another machine.
function exampleTransport(dispatch) {
  ExampleNetworkService.on(
    "recieve_outside_message",
    (host, msg, toActor) => {
      dispatch({
        src: `${host}@remoteService`,
        msg,
        snk: toActor,
      });
    },
  );

  return ({ snk, src, msg }) => {
    if (snk.endsWith("@remoteService")) {
      ExampleNetworkService.sendToHost(snk, {
        ...msg,
        src,
      });
      return true;
    } else {
      return false;
    }
  };
}

createActorSystem({
  transports: [exampleTransport],
});
```

The actor system will call `match` on each transport in the order they're provided, and halt after the first transport handler returns `true`. So transports that appear earlier in the list can intercept messages that would have matched with transports later in the list.

### enhancers

> `currentProvisions => additionalProvisions`

TODO

### realizers

> `async ({ spawnActor, dispatchEnvelope }) => systemUpdateListener`

TODO
