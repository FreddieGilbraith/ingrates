import fixedId from "fixed-id";

import defaultRAMRealizer from "./defaultRAMRealizer.js";

function createActorSystem({
	enhancers = [],
	realizers = [],
	transports = [],

	onErr = console.error,
} = {}) {
	const knownActors = {};

	const transporters = transports.map((x) => x());
	const contexts = [...realizers, defaultRAMRealizer].map((x) =>
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
			onErr("StartError", name);
			return null;
		}

		const self = fixedId();

		contexts.some((ctx) => ctx.spawn({ name, parent, nickname, self, args }));

		try {
			Promise.resolve(
				startup ? startup(getProvisionsForActor({ self, parent }), ...args) : undefined,
			)
				.then((state) => {
					contexts.some((ctx) =>
						ctx.spawn({ name, parent, nickname, self, args, state }),
					);
				})
				.catch((e) => onErr("StartError", e, { self, name }));
		} catch (e) {
			onErr("StartError", e, { self, name });
		}

		return self;
	}

	function doDispatch(src, self, _msg_) {
		const msg = Object.assign({ src }, _msg_);
		if (!transporters.some((x) => x(self, msg))) {
			contexts.some((ctx) => ctx.dispatch({ self, msg }));
		}
	}

	function doKill(parent, self) {
		contexts.some((ctx) => ctx.kill({ self, parent }));
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

		try {
			const newState = await knownActors[name](provisions, ...args);
			return newState;
		} catch (e) {
			onErr("RunError", e, { self, name, msg, state, parent });
		}
	}

	function getProvisionsForActor({ self, parent }) {
		const kill = doKill.bind(null, self);
		const dispatch = doDispatch.bind(null, self);
		const spawn = new Proxy(
			{},
			{
				get: (_, nickname, __) => doSpawn.bind(null, self, nickname),
			},
		);

		const baseProvisions = { self, parent, dispatch, spawn, kill };
		return enhancers.reduce((acc, val) => Object.assign(val(acc), acc), baseProvisions);
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
