import fixedId from "fixed-id";

import defaultRAMRealizer from "./defaultRAMRealizer.js";
export { defaultRAMRealizer };

function noop() {}

export function createActorSystem({
	enhancers = [],
	realizers = [defaultRAMRealizer],
	transports = [],

	onErr = console.error,
} = {}) {
	const knownActors = {};

	const mountingMsgs = {};

	const transporters = transports.map((x) => x(doDispatch, createActorSystem));
	const contexts = realizers.map((x) =>
		x({
			createActorSystem,
			doDispatch,
			doKill,
			doSpawn,
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

		mountingMsgs[self] = [];

		new Promise(async (done) => {
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

						let msg;
						const myMountingMsgs = mountingMsgs[self];
						delete mountingMsgs[self];
						while ((msg = myMountingMsgs.shift())) {
							doDispatch(...msg);
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
		if (self in mountingMsgs) {
			mountingMsgs[self].push([src, self, _msg_]);

			return;
		}

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
		contexts.some((ctx) => ctx.kill({ self, parent }));
	}

	async function runActor(meta) {
		const { self, parent, name, msg, state, children, args } = meta;
		const provisions = getProvisionsForActor({
			self,
			parent,
			name,
			children,
			state,
			msg,
		});

		try {
			const newState = await knownActors[name](provisions, ...args);
			return newState;
		} catch (error) {
			onErr("RunError", error, { self, name, msg, state, parent });
			const escalate = 1;
			const restart = 2;
			const resume = 3;
			const retry = 4;
			const stop = 5;

			const supervisionResponse = (knownActors[name].supervision || noop)(error, meta, {
				escalate,
				restart,
				resume,
				retry,
				stop,
			});

			switch (supervisionResponse) {
				case escalate:
					doDispatch(self, parent, { error, msg });
				case stop:
					doKill(parent, self);
					break;
				default:
				//onErr("RunError (unhandled)", error, { self, name, msg, state, parent });
			}
		}
	}

	function getProvisionsForActor(inputs) {
		const { self, parent } = inputs;
		const kill = doKill.bind(null, self);
		const dispatch = doDispatch.bind(null, self);
		const spawn = new Proxy(
			{},
			{
				get: (_, nickname, __) => doSpawn.bind(null, self, nickname),
			},
		);

		const baseProvisions = Object.assign(inputs, { dispatch, spawn, kill });
		return Object.assign(
			inputs,
			enhancers.reduce((acc, val) => Object.assign(val(acc), acc), baseProvisions),
		);
	}

	return getProvisionsForActor({
		register,
		self: null,
		parent: null,
	});
}
