## React Hooks

We probably can't surface a simple `useActor(async function*(){})` hooks, as this doesn't provide a built in way to destroy the actor when the component unmounts.
I instead think we're better off with something like this:

```javascript
const [addr, state, dispatch] = useActorInterface((state, msg) => {});
```

The actor interface is a pure function that can update its internal state based on the messages it receives, `addr` is the id of this actor, and `dispatch` can dispatch to any address with `addr` as the `src`
`useActorInterface` wraps this in a `async funciton*` that it manages, which it can exit when the component unmounts
