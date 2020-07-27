# Functions Vs Generators

It would be possible to use generator functions instead of regular functions to define actors. This would result in this sort of form:

```javascript
async function* actor(context) {
	let state = "something";

	while (true) {
		const msg = yeild;
	}
}
```

This has several interesting properties to it:

-   state is encapsulated at a language level, there's no need to create external wrappers
-   in my tests, async generators buffer and serialise messages automatically
-   theoretically less to learn, as it relies on built-in js syntax
-   always nice to find a use for generators
-   less tooling/lib support needed

The major downsides I can see are:

-   because state is now fully encapsulated, theres no way to rehydrate/recover/rollback state
-   there's no global message bus to snoop on
-   testing would require replaying _all_ relevant messages, you couldn't test a single state transistion

For the moment, I don't actually think there's enough value in moving to a generator based system, but it'd definitly something to think about one day
