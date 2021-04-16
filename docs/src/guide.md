# Guide

<div id="md-toc">

### Contents

<!-- vim-markdown-toc GFM -->

* [Who is this guide for](#who-is-this-guide-for)
* [Getting started](#getting-started)
   * [Install ingrates](#install-ingrates)
   * [Prepare your environment](#prepare-your-environment)
   * [Create your actor system](#create-your-actor-system)
* [Actors, an overview](#actors-an-overview)
   * [Spawning and sending](#spawning-and-sending)
   * [Actor Arguments](#actor-arguments)
   * [Message Ordering](#message-ordering)
   * [Known Addresses](#known-addresses)
   * [Async actors](#async-actors)
* [Stateful actors](#stateful-actors)
   * [Everything not saved will be lost](#everything-not-saved-will-be-lost)
   * [Parents of stateful actors](#parents-of-stateful-actors)
   * [Actually persisting state](#actually-persisting-state)
* [Communicating outside the system](#communicating-outside-the-system)
   * [Talking to another actor system](#talking-to-another-actor-system)
   * [Talking to a non-actor system](#talking-to-a-non-actor-system)
* [Extending Ingrates](#extending-ingrates)
* [Use without async generators](#use-without-async-generators)
* [Roadmap](#roadmap)
   * [Actor Supervision](#actor-supervision)
   * [Driving a view layer](#driving-a-view-layer)
   * [Typescript](#typescript)

<!-- vim-markdown-toc -->

</div>

## Who is this guide for

This guide is for people how have some familiarity with the concepts and goals of the actor model. Whether you've worked with actor systems your whole life, or are looking to try one out for the first time.

This guide is not for people who don't know what the actor model is, or why you would want to use it. If this is you, I'd suggest you head over to the [wikipedia article on the actor model][wikipedia] (it's uncommonly good for a programming wiki article) and get up to speed, it shouldn't take more than 5 minutes.

## Getting started

### Install ingrates

```shell
npm install @little-bonsai/ingrates
```

### Prepare your environment

Ingrates is designed to be used with [async][async] [generator][generator] functions, which aren't supported in some older versions of browsers or nodejs. To check if your given environment can run an async generator you can try evaluating the following code:

```javascript
async function* Test() {
  await new Promise((x) => setTimeout(x, 1));
  yield "foo";
  await new Promise((x) => setTimeout(x, 1));
  return "bar";
}
```

If that snippet creates errors, you can use [babel][babel] to compile your code into something that can run in your given environment.

> Note: you _can_ use ingrates **without** async generators, but it's not advised. You can find more information [here](#use-without-async-generators).

### Create your actor system

The default export from `@little-bonsai/ingrates` is [`createActorSystem`][createactorsystem]. This function returns another function, that can be used to start your root actor.

```javascript
import createActorSystem from "@little-bonsai/ingrates";

const actorSystem = createActorSystem();

function* RootActor() {}

actorSystem(RootActor);
```

`createActorSystem` can take arguments that will be used to configure the system, which we'll go into in more detail later.

## Actors, an overview

### Spawning and sending

Starting a `RootActor` on its own isn't much use, to have a _system_ we need more than one actor. We'll use the provided `spawn` function to start other actors

```javascript
function* ChildActor() {}

function* RootActor({ spawn }) {
  const childAddress = spawn(ChildActor);
}
```

The `spawn` function takes an actor as input, starts it in the system, and returns an address for that actor.

```javascript
function* RootActor({ spawn }) {
  const childAddress = spawn(ChildActor);
  console.log(childAddress);
}
```

```output
"GAKe8cxFFyiCN8mePsWc2OuM"
```

Addresses are how all communication between actors happens. Instead of **calling** **methods** on **objects** you should instead **send** a **message** to an **address**. You can send messages using the provided `dispatch` function:

```javascript
function* RootActor({ spawn, dispatch }) {
  const childAddress = spawn(ChildActor);
  dispatch(childAddress, { type: "REQUEST_GREETING" });
}
```

The recieveing actor uses the `yield` keyword to recieve its messages

```javascript
function* ChildActor() {
  const message = yield;
  console.log(message);
}
```

```output
{type: "REQUEST_GREETING", src: "Mw9mMOigEx3Xpu30V6gHq2pG"}
```

`dispatch` doesn't return anything, if an actor wants to recieve a response from a message, they must recieve that response as another message. The `src` property is added to all messages so actors know who to send their response to.

```javascript
function* ChildActor({ dispatch }) {
  const message = yield;
  const { type, src } = message;
  if (type === "REQUEST_GREETING") {
    dispatch(src, { type: "GREET" });
  }
}

function* RootActor({ spawn, dispatch }) {
  const childAddress = spawn(ChildActor);
  dispatch(childAddress, { type: "REQUEST_GREETING" });
  const message = yield;
  console.log(message);
}
```

```output
{type: "GREET", src: "GAKe8cxFFyiCN8mePsWc2OuM"}
```

Actors have a single mailbox that gets filled with messages from all sources. Messages are delivered to actors in the order they are received, one at a time.

Often you will want to place your `yield` statement inside some sort of loop, so the actor can process many messages:

```javascript
function* RunForeverActor() {
  while (true) {
    const msg = yield;
  }
}

function* RunUntilStoppedActor() {
  let running = true;
  while (running) {
    const msg = yield;
    if (msg.type === "STOP") {
      running = false;
    }
  }
}
```

### Actor Arguments

Sometimes you might want to spawn multiple instances of the same actor, with slight differences. Let's use this `NamedChildActor` as an example:

```javascript
function* NamedChildActor(
  { dispatch },
  firstName,
  lastName,
) {
  const msg = yield;
  if (msg.type === "REQUEST_GREETING") {
    dispatch(msg.src, {
      type: "RESPOND_GREETING",
      greeting: `Hello from ${firstName} ${lastName}`,
    });
  }
}
```

This actor will respond differently depending on what the values of `firstName` and `lastName` are, and we can set them when we initially `spawn` the actor

```javascript
function* RootActor({ spawn, dispatch }) {
  const cain = spawn(NamedChildActor, "Cain", "Smith");
  const abel = spawn(NamedChildActor, "Abel", "Smith");

  dispatch(cain, { type: "REQUEST_GREETING" });
  dispatch(abel, { type: "REQUEST_GREETING" });

  while (true) {
    const { greeting } = yield;
    console.log(greeting);
  }
}
```

```output
"Hello from Abel Smith"
"Hello from Cain Smith"
```

This output looks almost like what we'd expect, but there's one difference: the greetings are printed in a different order than we'd expect

### Message Ordering

Messages are always handled in the order they are recieved **for a specific actor**, but ingrates makes no gaurentees on message delivery between actors.

```javascript
function* ChildActor() {
  while (true) {
    const msg = yield;
    console.log(msg.value);
  }
}

function* RootActor({ spawn, dispatch }) {
  const child1 = spawn(ChildActor);
  const child2 = spawn(ChildActor);

  dispatch(child1, { value: "a" });
  dispatch(child1, { value: "b" });
  dispatch(child2, { value: "c" });
  dispatch(child2, { value: "d" });
}
```

```output
"a" "b" "c" "d"
or
"a" "c" "b" "d"
or
"c" "d" "a" "b"
or
"a" "c" "d" "b"
```

Ingrates gaurentees that `child1` will handle `"a"` before it handles `"b"`, and that `child2` will handle `"c"` before it handles `"d"`, but `child2` might handle all its messages before `child1` is even called once

### Known Addresses

All actors are passed two known addresses: `self` and `parent`. The `parent` address of the root actor will always be `null`.

```javascript
function* ChildActor({ self, parent }) {
  console.log("child", parent, self);
}

function* RootActor({ spawn, self, parent }) {
  const child = spawn(ChildActor);
  console.log("root", parent, self, child);
}
```

```output
"child" "uFsRt4vt4BKP5SekmyUa5Dmw" "Dcqq8RcX0fR8FMHMJmcMgzmL"
"root" null "uFsRt4vt4BKP5SekmyUa5Dmw" "Dcqq8RcX0fR8FMHMJmcMgzmL"
```

### Async actors

All the actors we've worked with so far have been sync actors, but if we use `async function*`s we gain access to asyncronus funcitonality

```javascript
async function* NetworkGreeter({ dispatch }) {
  while (true) {
    const msg = yield;
    if (msg.type === "REQUEST_GREETING") {
      const networkPayload = await fetch(
        "/api/currentUser",
      ).then((x) => x.json());
      dispatch(msg.src, {
        type: "GREET",
        greeting: `Hello ${networkPayload.username}`,
      });
    }
  }
}
```

This allows an actor to handle asyncronus functionality, while still only processing one message at a time.

## Stateful actors

So far we've been looking only at stateless actors: when the program is closed and re-opened, we'll have to recreate all our actors from scratch again. Sometimes we'll want to create actors that can seamlessly restart from their current state if the actor system shuts down. Ingrates provides support for this:

When `UserDBActor` first runs, `state` will be `undefined`, and defaulted to an empty object. As the actor system runs the actor will add more users to the `state` variable. Because `UserDBActor` `yield`s `state`, will be persisted outside the actor system to some sort of storage provider. If the actor system shuts down and starts up again `UserDBActor` will be respawned, but this time `state` will be equal to the last value that was yielded.

```javascript
function* UserDBActor({ state = {} }) {
  console.log("startup", Object.keys(state).length);
  while (true) {
    const msg = yield state;
    if (msg.type === "ADD_USER") {
      state[msg.userId] = msg.userDetails;
      console.log("ongoing", Object.keys(state).length);
    }
  }
}
```

```output
"startup" 0
"ongoing" 1
"ongoing" 2
"ongoing" 3
// the user closes their browser, and re-opens it some time later
"startup" 3
"ongoing" 4
"ongoing" 5
"ongoing" 6
```

### Everything not saved will be lost

If an actor is stateful, it's important to make sure that every variable that needs to be persisted is stored inside `state`. Any variables that are just created inside the actor will be lost on shutdown.

```javascript
function* UserDBActor({ state = {} }) {
  let userCount = 0;
  console.log(
    "startup",
    Object.keys(state).length,
    userCount,
  );
  while (true) {
    const msg = yield state;
    if (msg.type === "ADD_USER") {
      state[msg.userId] = msg.userDetails;
      userCount++;
      console.log(
        "ongoing",
        Object.keys(state).length,
        userCount,
      );
    }
  }
}
```

```output
"startup" 0 0
"ongoing" 1 1
"ongoing" 2 2
"ongoing" 3 3
// the user closes their browser, and re-opens it some time later
"startup" 3 0
"ongoing" 4 1
"ongoing" 5 2
"ongoing" 6 3
```

Because `userCount` is defined outside of `state`, it is not persisted and re-provided to `UserDBActor` when it next starts up.

### Parents of stateful actors

When an actor system starts up and finds it has persisted actors to restart, it will recreate them **With the same address they were originally spawned with**. This means that the **Parent** of **any** stateful actor **must also** be stateful and store the addressess of its stateful actors inside it's own `state` property.

To show why, let's look at an example of what not to do:

```javascript
function* UserDBActor({ state = {} }, self) {
  console.log(self, "startup", Object.keys(state).length);
  while (true) {
    const msg = yield state;
    if (msg.type === "ADD_USER") {
      state[msg.userId] = msg.userDetails;
      console.log(
        self,
        "ongoing",
        Object.keys(state).length,
      );
    }
  }
}

function* RootActor({ spawn, dispatch }) {
  const userDb = spawn(UserDBActor);
  dispatch(userDb, {
    type: "ADD_USER",
    userId: 1,
    userDetails: { name: "Alice" },
  });
  dispatch(userDb, {
    type: "ADD_USER",
    userId: 2,
    userDetails: { name: "Bob" },
  });
  dispatch(userDb, {
    type: "ADD_USER",
    userId: 3,
    userDetails: { name: "Clair" },
  });
}
```

```output
1GsoDGgoRQSepprEYxfUXHxH "startup" 0
1GsoDGgoRQSepprEYxfUXHxH "ongoing" 1
1GsoDGgoRQSepprEYxfUXHxH "ongoing" 2
1GsoDGgoRQSepprEYxfUXHxH "ongoing" 3
// the user closes their browser, and re-opens it some time later
1GsoDGgoRQSepprEYxfUXHxH "startup" 3
WKjcwBqUopez6bDOrvDcvLv1 "startup" 0
WKjcwBqUopez6bDOrvDcvLv1 "ongoing" 1
WKjcwBqUopez6bDOrvDcvLv1 "ongoing" 2
WKjcwBqUopez6bDOrvDcvLv1 "ongoing" 3
```

In this example, we would expect the restarted `RootActor` to send messages to a `UserDBActor` that has already recieved them, which would result in no change.
We can see in the output that the actor with address `1GsoDGgoRQSepprEYxfUXHxH` is being restarted, but we're also starting a new actor with address `WKjcwBqUopez6bDOrvDcvLv1` that is recieving all the messages from `RootActor`.
This is because `RootActor` didn't store the address of `userDb` in its state, so it doesn't know that there's a restarted instance of `UserDBActor` that it can use.

```javascript
function* RootActor({ spawn, dispatch, state = {} }) {
  state.userDb = state.userDb || spawn(UserDBActor);
  dispatch(userDb, {
    type: "ADD_USER",
    userId: 1,
    userDetails: { name: "Alice" },
  });
  dispatch(userDb, {
    type: "ADD_USER",
    userId: 2,
    userDetails: { name: "Bob" },
  });
  dispatch(userDb, {
    type: "ADD_USER",
    userId: 3,
    userDetails: { name: "Clair" },
  });
}
```

```output
1GsoDGgoRQSepprEYxfUXHxH "startup" 0
1GsoDGgoRQSepprEYxfUXHxH "ongoing" 1
1GsoDGgoRQSepprEYxfUXHxH "ongoing" 2
1GsoDGgoRQSepprEYxfUXHxH "ongoing" 3
// the user closes their browser, and re-opens it some time later
1GsoDGgoRQSepprEYxfUXHxH "startup" 3
1GsoDGgoRQSepprEYxfUXHxH "ongoing" 3
1GsoDGgoRQSepprEYxfUXHxH "ongoing" 3
1GsoDGgoRQSepprEYxfUXHxH "ongoing" 3
```

By moving `userDb` into state, `RootActor` will now be restarted with the correct address.

### Actually persisting state

If you try to run the above example, you'll notice that none of the actors are actually being restarted between runs. Ingrates doesn't provide any persisting by default, and you will instead have to use a [realizer][realizers] to tell ingrates how to persist your actors.

There are different realizers available as npm packages which you can find on the [ecosystem][eco] page

## Communicating outside the system

So far we've explored a lot of cool functionality, and you're probably starting to get an idea of how you could build some pretty complex systems using ingrates' actor model. But there always eventually comes a time when the system you're developing has to talk to the outside world. This might mean talking to _another different actor system_ running in another process, or on another machine, or talking to _a completly different bit of code_ like our UI library, or a REST API. We're going to explore how [transports] can be used to achieve both these goals

### Talking to another actor system

This is something we could probably already achieve using the functionality we already know about. Take a look at the following example:

```javascript
async function* SecretaryActor({ dispatch }) {
  while (true) {
    const msg = yield;
    const [remoteAddress, host] = msg.destination.split(
      "@",
    );

    const reponse = await SomeSocketLibrary.connect(
      host,
    ).send(msg.data);

    dispatch(msg.src, response);
  }
}

function* RootActor({ spawn, dispatch }) {
  const secretary = spawn(SecretaryActor);
  dispatch(secretary, {
    destination: "abcd123@example.com",
    data: {
      foo: true,
    },
  });

  const responseFromExampleServer = yield;
}
```

This is a really cool idea! Using our `SecretaryActor` we can send messages to other computers with almost the same syntax, and `RootActor` doesn't have to know anything about our network configuration to do it! _But_, it would be even nicer if we could use exactly the same syntax as usual, and do-away with the `SecretaryActor`, like this:

```javascript
function* RootActor({ spawn, dispatch }) {
  dispatch("abcd123@example.com", { foo: true });
  const responseFromExampleServer = yield;
}
```

This is possible if we use a [transport][transports] in our actor system, to handle messages that need to be delivered to other systems:

```javascript
function exampleDotComTransport(dispatch) {
  SomeSocketLibrary.connect("example.com").on(
    "message",
    (msg) => dispatch(msg),
  );

  return ({ msg, snk }) => {
    if (snk.endsWith("@example.com")) {
      SomeSocketLibrary.connect("example.com").send(msg);
      return true;
    } else {
      return false;
    }
  };
}

createActorSystem({
  transports: [exampleDotComTransport],
})(RootActor);
```

This guide isn't going to go into much further detail on _implementing_ a transport, you can read more about that in the [api docs][transports] and look at pre-existing transports in the [ecosystem][eco] page; but what you need to know is that _"transports enable **transparent** communication across actor system boundaries"_

### Talking to a non-actor system

You might, for example, want to build a web app. You could use ingrates to power your buisness logic, and then pick from a wide variety of UI tools to drive your DOM interactions:

- React if you're a populist
- Vue if you're an introvert
- JQuery if you're 45
- Ember if you haven't actually worked in web-dev for the lat 5 years
- Svelte if you spend more time on hacker news than actually shipping products

> (For legal reasons, these are all good natured jokes)

---

You could create a new actor that provides an interface with your UI library:

```javascript
function* DOMActor({ dispatch }) {
  //note: this isn't a valid event
  window.addEventHandler("all", (event) =>
    dispatch(event.target.dataset.actorAddr, event),
  );

  while (true) {
    const msg = yeild;
    switch (msg.type) {
      case "ADD_ELEMENT": {
        const el = document.createElement(msg.elementType);
        el.dataset.actorAddr = msg.src;
        document
          .getElementById(msg.parentElementId)
          .appendChild(el);
      }
      // other DOM manipluations ...
    }
  }
}

function* RooActor({ spawn, dispatch }) {}
```

## Extending Ingrates

## Use without async generators

## Roadmap

### Actor Supervision

### Driving a view layer

### Typescript

[async]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
[babel]: https://babeljs.io/setup
[createactorsystem]: /api.html#createactorsystem
[generator]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/GeneratorA
[wikipedia]: https://en.wikipedia.org/wiki/Actor_model
[realizers]: /api.html#realizers
[transports]: /api.html#transports
[eco]: /eco.html
