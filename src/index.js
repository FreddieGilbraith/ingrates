import { customAlphabet } from "nanoid";

import createDefaultRAMRealizer from "./defaultRAMRealizer.js";
export { createDefaultRAMRealizer };

export const makeAddress = customAlphabet(
	"23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz",
	14,
);

const escalate = 1;
const restart = 2;
const resume = 3;
const retry = 4;
const stop = 5;

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

	addressFn = makeAddress,
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

	function doSpawn(parent, nickname, { name }, ...args) {
		if (!knownActors[name]) {
			onErr("StartError", name, "unregistered actor");
			return null;
		}

		const self = addressFn();
		(msgQueue[parent] || []).unshift({
			special: "ADD_CHILD",
			nickname,
			child: self,
		});
		setTimeout(doDrain, 0, self);

		msgQueue[self] = [
			{ type: "Start", src: null },
			{ type: "Mount", src: null },
		];
		mountingActors[self] = true;

		setMetaInRealizers({
			children: {},
			name,
			parent,
			nickname,
			self,
			args,
			state: null,
		})
			.then(() => {
				mountingActors[self] = false;
				setTimeout(doDrain, 0, self);
			})
			.catch((e) => onErr("StartError", e, { self, name }));

		return self;
	}

	function getMetaFromRealizers(addr) {
		return promiseChain(
			realizerInstances.map((realizer) => () => realizer.get(addr, knownActors)),
		);
	}

	function setMetaInRealizers(meta) {
		const { children, name, parent, nickname, self, args, state } = meta;
		return Promise.all(
			realizerInstances.map((realizer) =>
				realizer.set({ children, name, parent, nickname, self, args, state }, knownActors),
			),
		);
	}

	function doDispatch(src, snk, rawMessage) {
		const msg = Object.assign({ src }, rawMessage);
		if (msgQueue[snk]) {
			msgQueue[snk].push(msg);
		} else {
			// TODO test that Mount is being called when first dispatching to an actor that
			// existed in a persisted realizer
			msgQueue[snk] = [{ type: "Mount", src: null }, msg];
		}

		setTimeout(doDrain, 0, snk);

		return snk;
	}

	async function doDrain(self) {
		if (draining[self] || msgQueue[self].length === 0 || mountingActors[self]) {
			return;
		}
		draining[self] = true;

		const msg = msgQueue[self].shift();

		if (msg.special === "ADD_CHILD") {
			getMetaFromRealizers(self).then((bundle) =>
				setMetaInRealizers(
					Object.assign({}, bundle, {
						children: Object.assign({}, bundle.children, {
							[msg.nickname]: msg.child,
						}),
					}),
				),
			);
		} else {
			await Promise.resolve(
				transporters.some((x) => x(self, msg)) ||
					getMetaFromRealizers(self).then((bundle) =>
						bundle
							? runActor(Object.assign({ msg }, bundle))
									.then((output) =>
										Object.assign({}, bundle, {
											state: output === undefined ? bundle.state : output,
										}),
									)
									.then(setMetaInRealizers)
							: null,
					),
			);
		}

		setTimeout(doDrain, 0, self);
		draining[self] = false;
	}

	function doKill(parent, self) {
		// TODO change the parent param to callerBundle. Detect if it's a valid call here
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
			const knownActor = knownActors[name];
			const actorRunner =
				typeof knownActor === "function" ? knownActor : knownActor[msg.type];

			if (!actorRunner) {
				return;
			}

			const newState = await actorRunner(provisions, ...args);

			if (typeof newState === "function") {
				return newState(state);
			} else {
				return newState;
			}
		} catch (error) {
			return handleActorError(meta, error);
		}
	}

	async function handleActorError(meta, error) {
		const { msg, name, parent, self, state } = meta;

		onErr("RunError", error, { self, name, msg, state, parent });

		const supervisionResponse = (knownActors[name].supervision || noop)(error, meta, {
			escalate,
			restart,
			resume,
			retry,
			stop,
		});

		switch (supervisionResponse) {
			case escalate:
			case restart: {
				return null;
			}
			case resume:
			case retry:
			case stop:
			default:
			//onErr("RunError (unhandled)", error, { self, name, msg, state, parent });
		}
	}

	function getProvisionsForActor(inputProvisions) {
		const { self } = inputProvisions;
		const kill = doKill.bind(null, self);
		const dispatch = doDispatch.bind(null, self);
		const spawn = new Proxy(
			function nakedSpawn() {
				return doSpawn(self, addressFn(), ...arguments);
			},
			{
				get: (_, nickname, __) => doSpawn.bind(null, self, nickname),
			},
		);

		const baseProvisions = Object.assign(inputProvisions, { dispatch, spawn, kill });

		return Object.assign(
			inputProvisions,
			enhancers.reduce((acc, val) => Object.assign(val(acc), acc), baseProvisions),
		);
	}

	return getProvisionsForActor({
		register,
		self: null,
		parent: null,
		mount: (addr) => {
			msgQueue[addr] = [{ type: "Mount", src: null }];
			setTimeout(doDrain, 0, addr);
		},
	});
}
