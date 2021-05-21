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
	realizers = [createDefaultRAMRealizer()],
	transports = [],

	onErr = console.error,
} = {}) {
	let draining = {};
	const knownActors = {};
	const mountingActors = {};
	const msgQueue = {};

	const transporters = transports.map((x) => x(doDispatch, createActorSystem));

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
					startup ? startup(getProvisionsForActor({ self, parent }), ...args) : undefined,
				)
					.then((state) =>
						promiseChain(
							realizers.map((realizer) => () =>
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
	}

	function doDrain(self) {
		if (draining[self] || msgQueue[self].length === 0 || mountingActors[self]) {
			return;
		}
		draining[self] = true;

		const msg = msgQueue[self].shift();

		if (msg.special === "ADD_CHILD") {
			Promise.all(
				realizers.map((realizer) =>
					realizer.get(self, knownActors).then((maybeBundle) =>
						maybeBundle
							? realizer.set({
									...maybeBundle,
									children: {
										...maybeBundle.children,
										[msg.nickname]: msg.child,
									},
							  })
							: null,
					),
				),
			).then(() => {
				setTimeout(doDrain, 0, self);
				draining[self] = false;
			});
			return;
		}

		Promise.resolve(
			transporters.some((x) => x(self, msg)) ||
				Promise.all(realizers.map((realizer) => realizer.get(self, knownActors)))
					.then((bundles) => bundles.map((b, i) => [b, i]).find((x) => !!x[0]))
					.then((indexedBundle) =>
						indexedBundle
							? runActor(Object.assign({ msg }, indexedBundle[0])).then((state) =>
									realizers[indexedBundle[1]].set(
										Object.assign({}, indexedBundle[0], { state }),
										knownActors,
									),
							  )
							: null,
					),
		).then(() => {
			setTimeout(doDrain, 0, self);
			draining[self] = false;
		});
	}

	function doKill(parent, self) {
		realizers.forEach((realizer) => realizer.kill({ self, parent }, knownActors));
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
