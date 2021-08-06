## Examples
### Client-Server Todo app
Create both the client and server for a todo app. The server will persist to the file system, the client will drive the DOM, there will be a transport layer on each side to enable communication

## Messages in Realizers

### First, we need to review the ordering in which realizers should be placed:

- RAM first: we would broardcast PUTs to all realizers, then run GETs going down the list. The first realizer that has the required state can return it. This would mean that the RAM realizer can essentially act as a cache for all lower realizers
  - pros: simple, built in
  - cons: no ability for realizers to manage the cache of infrequently access actors
- RAM last: we would run sequential PUTS, waiting for one of the realizers to say that they've handle it, and boardcastt GETs to all realizers, letting the only one that contains the actor do its responding
  - pros: single responsibility per realizers, fully controls cache
  - cons: each individual realizer will be responsible for its own in memory cache

### And that isn't even related to the question of storing messages in realizers.

- must be cascade: we must gaurentee that a message is sent AT MOST ONCE
- which side would they be persisted? before/after the transport? at send, at recieve
- how should they be indexed? probably by the reciever, so they can be colocated in the same realizer
- would create a heirarchy of pulling:
  - we cant race the `pull` operation, as that could lead to underliverd messages
  - we must fully drain the first realizer, then the next, and so on
  - which means that messages to actors in higher realizers will be handled first
    - is this a feature, rather than a bug...

## React Hooks

We probably can't surface a simple `useActor(async function*(){})` hooks, as this doesn't provide a built in way to destroy the actor when the component unmounts.
I instead think we're better off with something like this:

```javascript
const [
  addr,
  state,
  dispatch,
] = useActorInterface((state, msg) => {});
```

The actor interface is a pure function that can update its internal state based on the messages it receives, `addr` is the id of this actor, and `dispatch` can dispatch to any address with `addr` as the `src`
`useActorInterface` wraps this in a `async funciton*` that it manages, which it can exit when the component unmounts

