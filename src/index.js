import fixedId from "fixed-id";

import localRealizer from "./localRealizer.js";

function createActorSystem({
	enhancers = [],
	realizers = [],
	transports = [],

	onErr = console.error,
} = {}) {
	const knownActors = {};

	const transporters = [defaultExternalTransport, ...transports].map((x) => x());
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

	function doSpawn(parent, nickname, { name, startup }) {
		if (!knownActors[name]) {
			onErr("Tried to spawn unknown actor", name);
			return null;
		}

		const self = fixedId();

		contexts.some(({ update }) => update("spawn", { self, parent, name, nickname }));

		const state = startup(getProvisionsForActor({ self, parent }));
		if (state) {
			contexts.some(({ update }) => update("publish", { self, state }));
		}

		return self;
	}

	function doDispatch(src, snk, _msg_) {
		const msg = Object.assign({ src }, _msg_);
		if (!transporters.some((x) => x(snk, msg))) {
			contexts.some(({ update }) => update("dispatch", { snk, msg }));
		}
	}

	async function runActor({ self, parent, name, msg, state, children }) {
		const provisions = {
			...getProvisionsForActor({ self, parent }),
			children,
			state,
			msg,
		};

		const newState = await knownActors[name](provisions);

		if (newState) {
			contexts.some(({ update }) => update("publish", { self, state: newState }));
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

	const defaultExternalTransportListeners = [];
	function defaultExternalTransport() {
		return (snk, msg) =>
			snk === null ? (defaultExternalTransportListeners.forEach((x) => x(msg)), true) : false;
	}

	return {
		register,
		listen: defaultExternalTransportListeners.push,
		...getProvisionsForActor({
			self: null,
			parent: null,
		}),
	};
}

export default createActorSystem;
