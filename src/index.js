import { nanoid } from "nanoid";
import * as R from "ramda";

//envelope: { src, msg, snk }

export function defineActor(name, fnOrState, maybeFn) {
	const fn = maybeFn ? maybeFn : fnOrState;
	const initialState = maybeFn ? fnOrState : undefined;
	const stateful = Boolean(maybeFn);

	const nameGenerator = typeof name === "function" ? name : () => name;

	return function createActorInstance(system, ...args) {
		const id = nanoid();
		const name = nameGenerator(...args);
		const postbox = [];

		let state = initialState;
		let running = false;

		async function checkPostbox() {
			if (running) {
				return;
			}

			running = true;
			const { src, msg, snk } = postbox.shift();

			const ctx = {
				dispatch: (snk, msg) => system.dispatch({ src: id, msg, snk }),

				get sender() {
					return src;
				},
				get parent() {
					return system.getParentOf(id);
				},
			};

			state = await fn(state, msg, ctx);

			running = false;

			if (postbox.length) {
				setTimeout(checkPostbox, 0);
			}
		}

		function submitEnvelope({ src, msg, snk }) {
			postbox.push({ src, msg, snk });
			checkPostbox();
		}

		system.addSelf(id, submitEnvelope);

		return id;
	};
}

export function createSystem({ root }) {
	const world = new Map();
	const parent = new Map();

	const externalSubscriptions = new Set();

	function subscribe(listener) {
		externalSubscriptions.add(listener);
	}

	function dispatch({ src, msg, snk }) {
		if (snk === "__EXTERNAL__") {
			for (const listener of externalSubscriptions) {
				listener(msg);
			}
			return;
		}

		world.get(snk)({
			src,
			msg,
			snk,
		});
	}

	function getParentOf(id) {
		return parent.get(id);
	}

	const rootActorAddr = root({
		dispatch,
		getParentOf,
		addSelf: (id, submitEnvelope) => {
			world.set(id, submitEnvelope);
			parent.set(id, "__EXTERNAL__");
		},
	});

	return {
		subscribe,
		dispatch: (msg) => {
			dispatch({
				src: "__EXTERNAL__",
				msg,
				snk: rootActorAddr,
			});
		},
	};
}
