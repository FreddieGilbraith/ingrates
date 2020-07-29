import { nanoid } from "nanoid";

function noop() {}

export default function createActorSystem({
	transports = [],
	snoop = noop,
	onErr = console.error,
} = {}) {
	const actors = {};

	const transporters = transports.map((x) => x(dispatchEnvelope));

	const shutdown = (id) => {
		snoop(id);
		delete actors[id];
	};

	function dispatchEnvelope(envelope) {
		const { src, msg, snk } = envelope;
		snoop(envelope);

		transporters
			.filter((x) => x.match(envelope))
			.forEach((x) => x.handle(envelope));

		if (actors[snk]) {
			Promise.resolve(actors[snk].next(Object.assign({ src }, msg))).then(
				(x) => {
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

	const makeDispatch = (src) => (snk, msg) =>
		Promise.resolve().then(() => dispatchEnvelope({ src, snk, msg }));

	const makeSpawn = (parent) => (gen, ...args) => {
		const self = nanoid();

		snoop(self, gen, args);

		const x = gen(
			{
				self,
				parent,
				spawn: makeSpawn(self),
				dispatch: makeDispatch(self),
			},
			...args,
		);
		x.next();

		actors[self] = x;

		return self;
	};

	return makeSpawn(null);
}
