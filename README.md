# Ingrates

> An isomorphic actor system

![minzipped size](https://badgen.net/bundlephobia/minzip/@little-bonsai/ingrates)
![version](https://badgen.net/npm/v/@little-bonsai/ingrates)
![license](https://badgen.net/npm/license/@little-bonsai/ingrates)

---

`ingrates` borrows heavily from [nact](nact), but uses plain strings as addresses. This makes it easier to break your actor system up across workers/threads/processes/devices and transmit messages between them.

`ingrates` is very much WIP, and has no real world usage. I also don't know much about formal actor systems, so this might be missing some key functionality that you really want; please get in touch if so.

## Features

-   [x] stateful/stateless actors
-   [x] fully [async](async) (won't work on IE11)
-   [x] `transport`s for sending messages between actor systems
-   [x] `snoop`ing to watch all messages transmitted through the system
-   [x] `friends` and `children` containers, so you don't have to pollute your state with addresses
-   [x] `strict` mode analyses all messages to ensure they are serialisable
-   [ ] serialise/rehydrate an actor system to/from a string

## Docs

There's no docs yet, please refer to the [tests](tests) to get an overview of the api.

## Tests

All functionality starts with [tests](tests), please have a look through to get an overview of the api.

[async]: https://caniuse.com/#feat=async-functions
[nact]: https://nact.io/
[tests]: /test
