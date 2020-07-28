import { nanoid } from "nanoid";

function noop() {}

export default function createActorSystem({
	transports = [],
	snoop = noop,
} = {}) {
	const actors = {};

	const transporters = transports.map((x) => x(dispatchEnvelope));

	function dispatchEnvelope({ src, snk, msg }) {
		const envelope = { src, msg, snk };
		snoop(envelope);

		transporters
			.filter((x) => x.match(envelope))
			.forEach((x) => x.handle(envelope));

		if (actors[snk]) {
			actors[snk]
				.next(Object.assign({ src }, msg))
				.then((x) => {
					if (x.done) {
						delete actors[snk];
					}
				})
				.catch(() => {
					delete actors[snk];
				});
		}
	}

	const makeDispatch = (src) => (snk, msg) =>
		setTimeout(dispatchEnvelope, 0, { src, snk, msg });

	const makeSpawn = (parent) => (gen, ...args) => {
		const self = nanoid();

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
