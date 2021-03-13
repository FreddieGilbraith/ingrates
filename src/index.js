import fixedId from "fixed-id";

function fallbackSupervisor() {}

export default function createActorSystem({
	transports = [],
	enhancers = [],
	realizers = [],
	defaultSupervisor = fallbackSupervisor,

	onErr = console.error,
} = {}) {
	const roots = [];
	const actors = {};

	const transporters = transports.map((x) => x(dispatchEnvelope));

	const snoopers = [];

	const shutdown = (id) => {
		snoopers.forEach((f) => f("stop", { id }));
		delete actors[id];

		Object.entries(actors)
			.filter((x) => x[1].parent === id)
			.map((x) => x[0])
			.forEach(shutdown);
	};

	const onActorError = (id, msg, err) => {
		const actorInstance = actors[id];

		const supervisor = actorInstance.super;
		if (supervisor) {
			supervisor(actorInstance.provisions, {
				msg,
				err,
				state: actorInstance.state,
			});
		}

		onErr(id, err);
		shutdown(id);
	};

	function dispatchEnvelope(envelope) {
		const { src, msg, snk } = envelope;
		snoopers.forEach((f) => f("dispatch", envelope));

		transporters
			.filter((x) => x.match(envelope))
			.forEach((x) => x.handle(envelope));

		if (snk === "root") {
			return roots.forEach((snk) =>
				dispatchEnvelope(Object.assign({}, envelope, { snk })),
			);
		}

		if (actors[snk]) {
			const chonkyMsg = Object.assign({ src }, msg);
			try {
				Promise.resolve(actors[snk].itter.next(chonkyMsg)).then(
					(x) => {
						if (x.value) {
							snoopers.forEach((f) =>
								f("publish", { id: snk, value: x.value }),
							);
							actors[snk].state = x.value;
						}
						if (x.done) {
							shutdown(snk);
						}
					},
					(error) => {
						onActorError(snk, chonkyMsg, error);
					},
				);
			} catch (error) {
				onActorError(snk, chonkyMsg, error);
			}
		}
	}

	function spawnActor(_parent, gen, ...args) {
		const { parent, state, self } =
			_parent === null || typeof _parent === "string"
				? {
						parent: _parent,
						state: undefined,
						self: fixedId(),
				  }
				: _parent;

		snoopers &&
			snoopers
				.filter(Boolean)
				.forEach((f) => f("spawn", { parent, self, gen, args }));

		const provisions = enhancers.reduce(
			(provisions, enhancer) =>
				Object.assign({}, provisions, enhancer(provisions)),
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

		const itter = gen(provisions, ...args);

		Promise.resolve(itter.next()).then(
			(y) =>
				y.value &&
				snoopers &&
				snoopers.forEach((f) =>
					f("publish", { id: self, value: y.value }),
				),
		);

		if (parent === null) {
			roots.push(self);
		}

		actors[self] = {
			itter,
			parent,
			super: gen.supervision || defaultSupervisor,
			provisions,
		};

		return self;
	}

	if (realizers.length !== 0) {
		return Promise.all(
			realizers.map((realizer) =>
				realizer({ spawnActor, dispatchEnvelope }).then((x) =>
					snoopers.push(x),
				),
			),
		).then(() => {
			if (!Object.keys(actors).length) {
				return spawnActor.bind(null, null);
			} else {
				return () => {};
			}
		});
	} else {
		return spawnActor.bind(null, null);
	}
}
