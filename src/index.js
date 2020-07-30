import { nanoid } from "nanoid";

function noop() {}

export default function createActorSystem({
	transports = [],
	snoop = noop,
	onErr = console.error,
	timeout = 1000,
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

	const makeQuery = () => (snk, msg, tim = timeout) => {
		const src = nanoid();
		return new Promise((done, fail) => {
			setTimeout(fail, tim);
			actors[src] = {
				next: (x) => {
					done(x);
					return Promise.resolve({ done: true });
				},
			};
			dispatchEnvelope({ snk, src, msg });
		});
	};

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
				query: makeQuery(),
			},
			...args,
		);
		x.next();

		actors[self] = x;

		return self;
	};

	return makeSpawn(null);
}
