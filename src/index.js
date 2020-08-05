import { nanoid } from "nanoid";

function noop() {}
function noopNoop() {
	return noop;
}

export default function createActorSystem({
	transports = [],
	snoop = noop,
	onErr = console.error,
	timeout = 1000,
	storage = noopNoop,
} = {}) {
	const actors = {};

	const transporters = transports.map((x) => x(dispatchEnvelope));

	const snoopers = [snoop, storage(() => {})];

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

	const makeSpawn = (parent) => (gen, ...args) => {
		const self = nanoid();
		snoopers.forEach((f) => f("spawn", { parent, self, gen, args }));

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
		Promise.resolve(x.next()).then(
			(y) =>
				y.value &&
				snoopers.forEach((f) =>
					f("publish", { id: self, value: y.value }),
				),
		);

		actors[self] = x;

		return self;
	};

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

	return makeSpawn(null);
}
