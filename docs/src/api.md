# API

<div id="md-toc">

### Contents

<!-- vim-markdown-toc GFM -->

* [Actor Provisions](#actor-provisions)
   * [spawn](#spawn)
   * [self](#self)
   * [parent](#parent)
   * [dispatch](#dispatch)
      * [src](#src)
   * [state](#state)
* [createActorSystem](#createactorsystem)
   * [onErr](#onerr)
   * [transports](#transports)
   * [enhancers](#enhancers)
   * [realizers](#realizers)
      * [systemUpdateListener](#systemupdatelistener)
      * [Stateful Actors Note](#stateful-actors-note)
* [createDefaultRAMRealizer](#createdefaultramrealizer)
* [makeAddress](#makeaddress)

<!-- vim-markdown-toc -->

</div>

## Actor Provisions

The first argument of every actor is its `provisions`. This is an object containing all the properties and functions that ingrates provide to enable your generator function to act as an actor.

There are several default provisions detailed below, that come built-in to ingrates, but it's easy to write your own, and inject them into every actor using an [enhancer](#enhancers)

### spawn

> `(actorGenerator, ...actorArgs) => address`

A function used to spawn new actors.

The first argument should be the generator that you want to sport as an actor, and following arguments will be passed through to the child actor

```javascript
function* ParentActor({ spawn }) {
  spawn(ChildActor);
  spawn(ChildActor, "Jane Roe");
}

function* ChildActor(provisions, name = "John Doe") {
  console.log(name);
}
```

```output
"John Doe"
"Jane Roe"
```

### self

The id of the current actor

```javascript
function* ParentActor({ spawn }) {
  const childId = spawn(ChildActor);
  console.log(childId);
}

function* ChildActor({ self }) {
  console.log(self);
}
```

```output
"LzMuGqSgjR9sIcePQb5kQQHA"
"LzMuGqSgjR9sIcePQb5kQQHA"
```

### parent

The id of the parent that spawned this actor

```javascript
function* ParentActor({ spawn, self }) {
  const childId = spawn(ChildActor);
  console.log(self);
}

function* ChildActor({ self, parent }) {
  console.log(parent);
}
```

```output
"kOksJglNhIRRsr4S2j6opH4N"
"kOksJglNhIRRsr4S2j6opH4N"
```

### dispatch

> `(address, message) => void`

The `dispatch` function is used to send messages to other actors. Actors can receive incoming messages using the `yield` keyword.

```javascript
function* ParentActor({ spawn, dispatch }) {
  const childAddr = spawn(ChildActor);
  dispatch(childAddr, {
    greeting: "hello",
  });
}

function* ChildActor() {
  const msg = yield;
  console.log(msg.greeting, "world");
}
```

```output
"hello world"
```

#### src

`dispatch` will automatically add the property `src` (short for "source") to every message, so that an actor knows where to send their reply

```javascript
function* ParentActor({ spawn, dispatch }) {
  const childAddr = spawn(ChildActor);
  dispatch(childAddr, {
    greeting: "hello",
  });
  const { greeting } = yield;
  console.log(greeting);
}

function* ChildActor({ dispatch }) {
  const { greeting, src } = yield;
  dispatch(src, {
    greeting: "hello to you too",
  });
}
```

```output
"hello to you too"
```

But an actor can also supply a custom `src` property, if it would like the response to go to a different actor;

```javascript
function* ParentActor({ spawn, dispatch }) {
  const childAddr = spawn(ChildActor);
  const secretaryAddr = spawn(SecretaryActor);

  dispatch(childAddr, {
    greeting: "hello",
    src: secretaryAddr,
  });
}

function* ChildActor({ dispatch }) {
  const { greeting, src } = yield;
  dispatch(src, {
    greeting: "hello to you too",
  });
}

function* SecretaryActor() {
  const { greeting } = yield;
  console.log("Secretary recieved", greeting);
}
```

```output
"Secretary recieved hello to you too"
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

> `({ onErr, transports, enhancers, realizers }) => (actor) => void`

`createActorSystem` is the only export from `@little-bonsai/ingrates`. It's used to create the system that all your actors will run in. It returns a function that can be used to mount a root actor. There are several config options that can be used to extend the behaviour of the system.

If you pass any `realizers` to the system, it will return a `Promise`.

### onErr

> `(address, internalActorConfig, error) => void`

This will be called whenever an actor throws. By default it is set to `console.error`, but you can provide any function.

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

The actor system will call each transport in the order they're provided, and halt after the first transport handler returns `true`. So transports that appear earlier in the list can intercept messages that would have matched with transports later in the list.

### enhancers

> `currentProvisions => additionalProvisions`

Enhancers allow you to inject additional provisions into every actor in a given actor system. This can be useful to extend the basic functionality of ingrates with more advanced functionality.

The enhancers are run in order, and each one receives all the provisions that an actor will receive. This means that enhancers can rely on provisions that are created by enhancers higher in the stack. If an enhancer returns a provision with the same name as an existing provision, it will overwrite that provision.

```javascript
function queryEnhancer({ spawn }) {
  function query(snk, msg, timeout = 100) {
    return new Promise((done, fail) => {
      function* QueryActor({ self, dispatch }) {
        dispatch(snk, msg);
        setTimeout(
          dispatch.bind(null, self, { type: "TIMEOUT" }),
          timeout,
        );

        const response = yield;

        if (response.type === "TIMEOUT") {
          fail({ type: "QUERY_TIMEOUT", timeout });
        } else {
          done(response);
        }
      }

      spawn(QueryActor);
    });
  }

  return { query };
}

function loggingQueryEnhancer({ query }) {
  function loggingQuery(...args) {
    console.log("Running Query", ...args);
    return query(...args);
  }

  return { loggingQuery };
}

createActorSystem({
  enhancers: [queryEnhancer, loggingQueryEnhancer],
});
```

### realizers

> `async ({ spawnActor, dispatchEnvelope }) => systemUpdateListener`

> `spawnActor = ({ parent, state, self }, generator, ...args) => self`

> `dispatchEnvelope = ({src, msg, snk}) => void`

Realizers are used to persist the state of stateful actors, and re-hydrate an actor system from persisted data on startup.

When first called, the realiser is responsible for re-creating any actors that are it knows were persisted from the last time the actor system was run. `spawnActor` should be called with

- `self`: the actor's own address
- `parent`: the actor's parent's address
- `state`: the persisted state of the actor
- `generator`: the generator function used to define the actor
- `...args`: any arguments used to initialize the actor

The realizer should return a promise that only resolves once `spawnActor` has been called for all persisted actors. This promise should resolve to a `systemUpdateListener` function

#### systemUpdateListener

> `("spawn", { parent, self, gen, args }) => void`

> `("dispatch", { src, msg, snk }) => void`

> `("publish", { id, value }) => void`

> `("stop", { id }) => void`

The `systemUpdateListener` function is used to listen to all changes that occour in the actor system. The first argument is a string describing what change has occoured, the second argument is an object containing information relevant to that change.

- `spawn` is called when an actor starts
- `dispatch` is called when one actor sends a message to another
- `publish` is called when an actor publishes their current state by `yield`ing it
- `stop` is called when an actor exits

These changes can be used by a realizer to persist all the information about a system that's needed to reconstruct it. The realiser can then persist this information to a storage provider, so the system can be re-hydrated when it is next started

#### Stateful Actors Note

Please note, not every actor needs to be stateful, and there's no requirement that a `realizer` do something for every change it's informed of. It should in fact be very common to have an actor system where only some of the actors persist their state to storage.

## createDefaultRAMRealizer

## makeAddress
