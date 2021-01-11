const { nanoid } = require("nanoid");

function noop() {}

module.exports = function createActorSystem({
	transports = [],
	snoop = noop,
	onErr = console.error,
	storage,
	enhancers = [],
} = {}) {
	const actors = {};

	const transporters = transports.map((x) => x(dispatchEnvelope));

	const snoopers = [snoop];

	const shutdown = (id) => {
		snoopers.forEach((f) => f("stop", { id }));
		delete actors[id];
	};

	function dispatchEnvelope(envelope) {
		const { src, msg, snk } = envelope;
		snoopers.forEach((f) => f("dispatch", envelope));

		transporters
			.filter((x) => x.match(envelope))
			.forEach((x) => x.handle(envelope));

		if (actors[snk]) {
			Promise.resolve(actors[snk].next(Object.assign({ src }, msg))).then(
				(x) => {
					snoopers.forEach(
						(f) =>
							x.value &&
							f("publish", { id: snk, value: x.value }),
					);
					if (x.done) {
						shutdown(snk);
					}
				},
				(x) => {
					onErr(snk, x);
					shutdown(snk);
				},
			);
		}
	}

	function spawnActor(_parent, gen, ...args) {
		const { parent, state, self } =
			_parent === null || typeof _parent === "string"
				? {
						parent: _parent,
						state: undefined,
						self: nanoid(),
				  }
				: _parent;

		snoopers &&
			snoopers
				.filter(Boolean)
				.forEach((f) => f("spawn", { parent, self, gen, args }));

		const provisions = enhancers.reduce(
			(provisions, enhancer) => ({
				...provisions,
				...enhancer(provisions),
			}),
			{
				self,
				parent,
				spawn: spawnActor.bind(null, self),
				state,

				dispatch: (snk, msg) =>
					Promise.resolve().then(() =>
						dispatchEnvelope({ src: self, snk, msg }),
					),
			},
		);

		const x = gen(provisions, ...args);

		Promise.resolve(x.next()).then(
			(y) =>
				y.value &&
				snoopers &&
				snoopers.forEach((f) =>
					f("publish", { id: self, value: y.value }),
				),
		);

		actors[self] = x;

		return self;
	}

	if (storage) {
		return storage(spawnActor)
			.then((x) => snoopers.push(x))
			.then(() => {
				if (!Object.keys(actors).length) {
					return spawnActor.bind(null, null);
				} else {
					return () => {};
				}
			});
	} else {
		return spawnActor.bind(null, null);
	}
};
