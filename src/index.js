import { nanoid } from "nanoid";

const noop = () => {};

export default function defineSystem({ loaders, snoop, transports = {} } = {}) {
	function createWorldHandlers({ world, rootId }) {
		async function callHandler({
			args,
			children,
			envelope,
			friends,
			handler,
			id,
			parent,
			state,
		}) {
			const updateState = await handler(
				state,
				envelope.msg,
				{
					self: id,
					children,
					friends,
					sender: envelope.src,
					parent,

					forward: (snk) => dispatch({ ...envelope, snk }),
					dispatch: (snk, msg, src) =>
						dispatch({ snk, msg, src: src || id }),

					spawn: (name, handler, ...args) => {
						const newId = nanoid();
						world.set(newId, {
							args,
							children: new Map(),
							friends: new Map(),
							handler,
							mailbox: [
								{
									src: "__INTERNAL__",
									snk: id,
									msg: { type: "INIT" },
								},
							],
							running: false,
							state: null,
							parent: id,
						});

						Promise.resolve().then(
							enqueueHandlerCall.bind(null, newId),
						);
						return newId;
					},
				},
				...(args || []),
			);

			const newState = (() => {
				switch (typeof updateState) {
					case "function":
						return updateState(state);
					case "undefined":
						return state;
					default:
						return updateState;
				}
			})();

			world.get(id).state = newState;
		}

		async function enqueueHandlerCall(id) {
			const {
				args,
				children,
				friends,
				handler,
				mailbox,
				parent,
				running,
				state,
			} = world.get(id);

			if (running || !mailbox.length) {
				return;
			}

			world.get(id).running = true;

			const envelope = mailbox.shift();

			await callHandler({
				args,
				children,
				envelope,
				friends,
				handler,
				id,
				parent,
				state,
			});

			world.get(id).running = false;

			Promise.resolve().then(enqueueHandlerCall.bind(null, id));
		}

		function dispatch(envelope) {
			const { snk, msg, src } = envelope;

			if (snk === "__EXTERNAL__") {
				subscribers.forEach((subscriber) => subscriber(msg));
				return;
			}

			if (world.get(snk)) {
				world.get(snk).mailbox.push(envelope);
				Promise.resolve().then(enqueueHandlerCall.bind(null, snk));
				return;
			}
			boundTransports
				.filter(({ match }) => match(envelope))
				.forEach((transport) => transport.handle(envelope));
		}

		const boundTransports = Object.values(transports).map((x) =>
			x(dispatch),
		);

		const subscribers = new Set();
		function subscribe(fn) {
			subscribers.add(fn);
		}
		function unsubscribe(fn) {
			subscribers.delete(fn);
		}

		function next() {
			return new Promise((done) => {
				function s(...args) {
					unsubscribe(s);
					done(...args);
				}
				subscribe(s);
			});
		}

		Promise.resolve().then(enqueueHandlerCall.bind(null, rootId));

		return {
			next,
			subscribe,
			unsubscribe,

			dispatch: (msg) => {
				dispatch({ snk: rootId, msg, src: "__EXTERNAL__" });
				return next();
			},
		};
	}

	function mount(rootActorDefinition, ...args) {
		const world = new Map();
		const rootId = nanoid();

		world.set(rootId, {
			args,
			children: new Map(),
			friends: new Map(),
			handler: rootActorDefinition,
			mailbox: [
				{ src: "__INTERNAL__", snk: rootId, msg: { type: "INIT" } },
			],
			running: false,
			state: undefined,
			parent: "__EXTERNAL__",
		});

		return createWorldHandlers({ world, rootId });
	}

	async function rehydrate(rootActorDefinition) {
		const {
			getActorDefinition,
			getArgs,
			getChildren,
			getFriends,
			getState,
		} = loaders;

		const world = new Map();
		let rootId = null;

		async function recusivelyLoadActor(id, parent = "__EXTERNAL__") {
			if (!rootId && id.length) {
				rootId = id;
			}

			const handler = await getActorDefinition(id);
			const args = (await getArgs(id)) || null;
			const children = (await getChildren(id)) || new Map();
			const friends = (await getFriends(id)) || new Map();
			const state = (await getState(id)) || null;

			if (id !== "") {
				world.set(id, {
					args,
					children,
					friends,
					handler,
					mailbox: [],
					running: false,
					state,
					parent,
				});
			}

			for (const child of children.values()) {
				await recusivelyLoadActor(child, id);
			}
		}

		await recusivelyLoadActor("");

		return createWorldHandlers({ world, rootId });
	}

	return {
		rehydrate,
		mount,
	};
}
