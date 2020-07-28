import { nanoid } from "nanoid";

function noop() {}

export default function createActorSystem({ transports = [] } = {}) {
	const actors = {};

	function dispatchEnvelope({ src, snk, msg }) {
		const envelope = { src, msg, snk };

		transporters
			.filter((x) => x.match(envelope))
			.forEach((x) => x.handle(envelope));

		if (actors[snk]) {
			actors[snk].next(Object.assign({ src }, msg));
		}
	}

	const makeDispatch = (src) => (snk, msg) =>
		dispatchEnvelope({ src, snk, msg });

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

	// ------------------------------

	const transporters = transports.map((x) => x(dispatchEnvelope));

	return makeSpawn("");
}
