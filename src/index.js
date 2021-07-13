import fixedId from "fixed-id";

import createDefaultRAMRealizer from "./defaultRAMRealizer.js";
export { createDefaultRAMRealizer };

function noop() {}

async function promiseChain(ps) {
	for (const p of ps) {
		const x = await p();
		if (x) {
			return x;
		}
	}
}

export function createActorSystem({
	enhancers = [],
	realizers = [createDefaultRAMRealizer],
	transports = [],

	onErr = console.error,
} = {}) {
	let draining = {};
	const knownActors = {};
	const mountingActors = {};
	const msgQueue = {};

	const transporters = transports.map((x) => x(doDispatch, createActorSystem));
	const realizerInstances = realizers.map((x) => x(createActorSystem));

	function register(actorDefinition) {
		knownActors[actorDefinition.name] = actorDefinition;
	}

	function doSpawn(parent, nickname, { name, startup }, ...args) {
		if (!knownActors[name]) {
			onErr("StartError", name, "unregistered actor");
			return null;
		}

		const self = fixedId();
		(msgQueue[parent] || []).unshift({
			special: "ADD_CHILD",
			nickname,
			child: self,
		});
		setTimeout(doDrain, 0, self);

		msgQueue[self] = [];
		mountingActors[self] = true;

		new Promise((done) => {
			try {
				Promise.resolve(
					startup
						? startup(getProvisionsForActor({ self, parent, name }), ...args)
						: undefined,
				)
					.then((state) =>
						Promise.all(
							realizerInstances.map((realizer) =>
								realizer.set(
									{
										children: {},
										name,
										parent,
										nickname,
										self,
										args,
										state,
									},
									knownActors,
								),
							),
						),
					)
					.then(() => {
						mountingActors[self] = false;
						setTimeout(doDrain, 0, self);
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
		const msg = Object.assign({ src }, _msg_);
		if (msgQueue[self]) {
			msgQueue[self].push(msg);
		} else {
			msgQueue[self] = [msg];
		}

		setTimeout(doDrain, 0, self);

		return self;
	}

	async function doDrain(self) {
		if (draining[self] || msgQueue[self].length === 0 || mountingActors[self]) {
			return;
		}
		draining[self] = true;

		const msg = msgQueue[self].shift();

		if (msg.special === "ADD_CHILD") {
			await promiseChain(
				realizerInstances.map((realizer) => () => realizer.get(self, knownActors)),
			).then((bundle) =>
				Promise.all(
					realizerInstances.map((realizer) =>
						realizer.set(
							Object.assign({}, bundle, {
								children: Object.assign({}, bundle.children, {
									[msg.nickname]: msg.child,
								}),
							}),
						),
					),
				),
			);
		} else {
			await Promise.resolve(
				transporters.some((x) => x(self, msg)) ||
					promiseChain(
						realizerInstances.map((realizer) => () => realizer.get(self, knownActors)),
					).then((bundle) =>
						bundle
							? runActor(Object.assign({ msg }, bundle))
									.then((output) =>
										Object.assign({}, bundle, {
											state: output === undefined ? bundle.state : output,
										}),
									)
									.then((bundle) =>
										Promise.all(
											realizerInstances.map((realizer) =>
												realizer.set(bundle),
											),
										),
									)
							: null,
					),
			);
		}

		setTimeout(doDrain, 0, self);
		draining[self] = false;
	}

	function doKill(parent, self) {
		realizerInstances.forEach((realizer) => realizer.kill({ self, parent }, knownActors));
	}

	async function runActor(meta) {
		const { args, children, msg, name, parent, self, state } = meta;
		const provisions = getProvisionsForActor({
			children,
			msg,
			name,
			parent,
			self,
			state,
		});

		try {
			const newState = await knownActors[name](provisions, ...args);
			if (typeof newState === "function") {
				return newState(state);
			} else {
				return newState;
			}
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
				//eslint-disable-next-line
				case stop:
					doKill(parent, self);
					break;
				default:
				//onErr("RunError (unhandled)", error, { self, name, msg, state, parent });
			}
		}
	}

	function getProvisionsForActor(inputs) {
		const { self } = inputs;
		const kill = doKill.bind(null, self);
		const dispatch = doDispatch.bind(null, self);
		const spawn = new Proxy(
			function nakedSpawn() {
				return doSpawn(self, fixedId(), ...arguments);
			},
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
