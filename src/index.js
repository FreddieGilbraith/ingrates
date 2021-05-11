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

		new Promise(async (done) => {
			for (const ctx of contexts) {
				const handled = await ctx.spawn({ name, parent, nickname, self, args });
				if (handled) {
					break;
				}
			}

			try {
				Promise.resolve(
					startup ? startup(getProvisionsForActor({ self, parent }), ...args) : undefined,
				)
					.then(async (state) => {
						for (const ctx of contexts) {
							const handled = await ctx.spawn({
								name,
								parent,
								nickname,
								self,
								args,
								state,
							});
							if (handled) {
								break;
							}
						}
					})
					.catch((e) => onErr("StartError", e, { self, name }));
			} catch (e) {
				onErr("StartError", e, { self, name });
			}
			done();
		});

		return self;
	}

	function doDispatch(src, self, _msg_) {
		new Promise(async (done) => {
			const msg = Object.assign({ src }, _msg_);
			if (!transporters.some((x) => x(self, msg))) {
				for (const ctx of contexts) {
					const handled = await ctx.dispatch({ self, msg });
					if (handled) {
						break;
					}
				}
			}
			done();
		});
	}

	function doKill(parent, self) {
		new Promise(async (done) => {
			for (const ctx of contexts) {
				const handled = await ctx.kill({ self, parent });
				if (handled) {
					break;
				}
			}
			done();
		});
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
