import { nanoid } from "nanoid";

function noop() {}

export default function createActorSystem({ transports = [] } = {}) {
	const externalListeners = new Set();
	const subscribe = (fn) => externalListeners.add(fn);
	const unsubscribe = (fn) => externalListeners.delete(fn);
	const next = () =>
		new Promise((done) => {
			function doNext(x) {
				done(x);
				unsubscribe(doNext);
			}
			subscribe(doNext);
		});

	// ------------------------------

	const actors = {};

	function dispatchEnvelope({ src, snk, msg }) {
		const envelope = { src, msg, snk };

		transporters
			.filter((x) => x.match(envelope))
			.forEach((x) => x.handle(envelope));

		if (snk === "") {
			externalListeners.forEach((externalListener) =>
				externalListener({ src, msg, snk }),
			);
		}

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

	const spawn = makeSpawn("");
	const dispatch = makeDispatch("");
	const transporters = transports.map((x) => x(dispatchEnvelope));

	return {
		spawn,
		dispatch,
		subscribe,
		unsubscribe,
		next,
	};
}
