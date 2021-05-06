import fixedId from "fixed-id";

import localRealizer from "./localRealizer.js";

function createActorSystem({
	enhancers = [],
	realizers = [],
	transports = [],

	onErr = console.error,
} = {}) {
	const knownActors = {};

	const transporters = transports.map((x) => x());
	const contexts = [...realizers, localRealizer].map((x) =>
		x({
			doSpawn,
			doDispatch,
			runActor,
		}),
	);

	function register(actorDefinition) {
		knownActors[actorDefinition.name] = actorDefinition;
	}

	function doSpawn(parent, nickname, { name, startup }, ...args) {
		if (!knownActors[name]) {
			onErr("Tried to spawn unknown actor", name);
			return null;
		}

		const self = fixedId();

		contexts.some((ctx) => ctx.spawn({ self, parent, name, nickname, args }));
		if (startup) {
			const state = startup(getProvisionsForActor({ self, parent }), ...args);
			if (state) {
				contexts.some((ctx) => ctx.publish({ self, state }));
			}
		}

		return self;
	}

	function doDispatch(src, snk, _msg_) {
		const msg = Object.assign({ src }, _msg_);
		if (!transporters.some((x) => x(snk, msg))) {
			contexts.some((ctx) => ctx.dispatch({ snk, msg }));
		}
	}

	async function runActor({ self, parent, name, msg, state, children, args }) {
		const provisions = Object.assign(
			{
				children,
				state,
				msg,
			},
			getProvisionsForActor({ self, parent }),
		);

		const newState = await knownActors[name](provisions, ...args);

		if (newState) {
			contexts.some((ctx) => ctx.publish({ self, state: newState }));
		}
	}

	function getProvisionsForActor({ self, parent }) {
		const dispatch = doDispatch.bind(null, self);
		const spawn = new Proxy(
			{},
			{
				get: (_, nickname, __) => doSpawn.bind(null, self, nickname),
			},
		);

		return { self, parent, dispatch, spawn };
	}

	return Object.assign(
		{
			register,
		},
		getProvisionsForActor({
			self: null,
			parent: null,
		}),
	);
}

export default createActorSystem;
