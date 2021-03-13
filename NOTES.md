## Supervision

Ok, so, a crashed generator can't be resumed, because there's no way for the generator function to know how to pull the next message in. The `throw` has stopped execution, so it can loop back up to the yield...

Because of this limitation, I don't actually think there's much value in trying to support proper supervision out of the box...

Addmitedly, because ingrates only requires an itter to have a `next` method, you could create a seperate wrapper that produces compatable itters from a pure function and a supervisor. But at that point you can still do the supervision in userland anyway, the only thing you'd be missing is escalation...

## React Hooks

We probably can't surface a simple `useActor(async function*(){})` hooks, as this doesn't provide a built in way to destroy the actor when the component unmounts.
I instead think we're better off with something like this:

```javascript
const [addr, state, dispatch] = useActorInterface((state, msg) => {});
```

The actor interface is a pure function that can update its internal state based on the messages it receives, `addr` is the id of this actor, and `dispatch` can dispatch to any address with `addr` as the `src`
`useActorInterface` wraps this in a `async funciton*` that it manages, which it can exit when the component unmounts

### injectHelpers

I should provide a way to inject helpers into the provided ingrates functions are are given to every actor. Things that could then be managed with these:

- queries
- pinging other actors for signs of life

### Pinging

Pinging should also export a function decorator that automatically intercepts and replies to `{type:"PING"}` messages

### Web Apps

you could totally have an adapter that allows actors to `yeild` jsx, where refs are replaced by what ever child `yields`:

```javascript

function* ParentActor({ spawn, }){
   const ChildComponent = spawn(ChildActor);
   let count = 0;

   while(true){
      const msg = yield <div>
         <span>count: {count}</span>
         <ChildComponent/>
      </div>

      if(msg.type === "INC"){
         count++;
      }
   }
}

function* ChildActor({dispatch, parent){
   while(true){
      const msg = yield (
         <button onClick={{type: "ON_CLICK"}} >
            Click Me
         </button>
      );

      if(msg.type === "ON_CLICK"){
         dispatch(parent, { type: "INC" });
      }
   }
}
```

fuck, that's genius
