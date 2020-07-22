import { nanoid } from "nanoid";

const noop = () => {};

function valIsStrictlyValid(x, path = "") {
	if (x === undefined) {
		return { valid: false, path, err: "property is undefined" };
	}

	if (typeof x === "function") {
		return { valid: false, path, err: "property is a Function" };
	}

	if (x instanceof Date) {
		return { valid: false, path, err: "property is a Date" };
	}

	if (typeof x === "symbol") {
		return { valid: false, path, err: "property is a Symbol" };
	}

	if (Array.isArray(x)) {
		return x.reduce((acc, value, i) => {
			const response = valIsStrictlyValid(
				value,
				path ? `${path}[${i}]` : `[${key}]`,
			);
			if (response.valid) {
				return acc;
			} else {
				return response;
			}
		});
	}

	if (typeof x === "object") {
		return Object.entries(x).reduce(
			(acc, [key, value]) => {
				const response = valIsStrictlyValid(
					value,
					path ? path + "." + key : key,
				);
				if (response.valid) {
					return acc;
				} else {
					return response;
				}
			},
			{
				valid: true,
			},
		);
	}

	return {
		valid: true,
	};
}

export function defineActor(name, fnOrState, maybeFn) {
	const initialState = maybeFn ? fnOrState : undefined;
	const stateful = Boolean(maybeFn);
	const fn = ((fnOrObj) =>
		typeof fnOrObj === "function"
			? fnOrObj
			: stateful
			? (s, m, c) => (fnOrObj[m.type] || noop)(s, m, c)
			: (m, c) => (fnOrObj[m.type] || noop)(m, c))(
		maybeFn ? maybeFn : fnOrState,
	);

	const nameGenerator = typeof name === "function" ? name : () => name;

	return function createActorInstance(parent, system, ...args) {
		const id = nanoid();
		const name = nameGenerator(...args);
		const postbox = [];
		const children = new Map();
		const friends = new Map();

		let state = initialState;
		let running = false;

		async function checkPostbox(x) {
			if (running || !postbox.length) {
				return;
			}

			running = true;

			const { src, msg, snk } = postbox.shift();

			const ctx = {
				parent,
				children,
				friends,
				args,
				name,

				self: id,
				sender: src,

				dispatch: (snk, msg) => system.dispatch({ src: id, msg, snk }),
				forward: (snk) => system.dispatch({ src, msg, snk }),

				spawn: (name, actor, ...args) => {
					const childId = actor(id, system, ...args);
					children.set(name, childId);
					return childId;
				},
			};

			try {
				if (stateful) {
					const response = await fn(state, msg, ctx);
					switch (typeof response) {
						case "function":
							state = response(state);
							break;
						case "undefined":
							break;
						default:
							state = response;
							break;
					}
				} else {
					await fn(msg, ctx);
				}
			} catch (e) {
				console.error(e);
			}

			running = false;

			if (postbox.length) {
				setTimeout(checkPostbox, 0, "f");
				checkPostbox("f");
			}
		}

		function submitEnvelope({ src, msg, snk }) {
			postbox.push({ src, msg, snk });
			checkPostbox();
		}

		system.addSelf(id, { name, submitEnvelope });

		return id;
	};
}

export function createSystem({ root, transports = {}, snoop, strict }) {
	const world = new Map();
	const dispatcherFallbacks = [];

	const externalSubscriptions = new Set();

	function subscribe(listener) {
		externalSubscriptions.add(listener);
	}

	function next() {
		return new Promise((done) => subscribe(done));
	}

	function dispatch({ src, msg, snk }) {
		(snoop || noop)(arguments[0]);
		if (strict) {
			const { valid, err, path } = valIsStrictlyValid(arguments[0]);
			if (!valid) {
				strict({
					src,
					msg,
					snk,
					error: { err, path },
				});
			}
		}

		if (snk === "__EXTERNAL__") {
			for (const listener of externalSubscriptions) {
				listener(msg);
			}
			return;
		}

		const dispatchers = world.get(snk)
			? [world.get(snk)]
			: dispatcherFallbacks
					.filter(({ match }) => match({ src, msg, snk }))
					.map(({ handle }) => handle);

		for (const dispatcher of dispatchers) {
			dispatcher({
				src,
				msg,
				snk,
			});
		}
	}

	for (const transport of Object.values(transports)) {
		dispatcherFallbacks.push(transport(dispatch));
	}

	const rootActorAddr = root("__EXTERNAL__", {
		dispatch,
		addSelf: (id, { submitEnvelope }) => {
			world.set(id, submitEnvelope);
			dispatch({
				src: "__INTERNAL__",
				msg: { type: "INIT" },
				snk: id,
			});
		},
	});

	return {
		subscribe,
		next,
		dispatch: (msg) => {
			dispatch({
				src: "__EXTERNAL__",
				msg,
				snk: rootActorAddr,
			});
		},
	};
}
