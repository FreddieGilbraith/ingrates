import { nanoid } from "nanoid";

const noop = () => {};

export default function defineSystem({ loaders, snoop, transports } = {}) {
	function createWorldHandlers(world) {
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

					dispatch: (snk, msg, src) =>
						dispatch({ snk, msg, src: src || id }),
				},
				...(args || []),
			);
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

			setTimeout(enqueueHandlerCall, 0, id);
		}

		function dispatch(envelope) {
			const { snk, msg, src } = envelope;

			if (snk === "__EXTERNAL__") {
				subscribers.forEach((subscriber) => subscriber({ msg, src }));
				return;
			}

			world.get(snk).mailbox.push(envelope);

			setTimeout(enqueueHandlerCall, 0, snk);
		}

		//todo, unsubscribe
		const subscribers = [];
		function subscribe(fn) {
			subscribers.push(fn);
		}

		function next() {
			return new Promise((done) => subscribe(done));
		}

		return {
			dispatch: (snk, msg) => {
				dispatch({ snk, msg, src: "__EXTERNAL__" });
				return next();
			},
		};
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

		async function recusivelyLoadActor(id, parent) {
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

		return createWorldHandlers(world);
	}

	return {
		rehydrate,
	};
}
