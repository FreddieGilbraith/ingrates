import { nanoid } from "nanoid";

function noop() {}

export default function createActorSystem(rootActor, { transports = {} } = {}) {
	let doNext = noop;

	const actors = {};

	const makeDispatch = (src) => (snk, msg) => {
		const envelope = { src, msg, snk };

		if (snk === "") {
			doNext(envelope);
			return;
		}

		if (actors[snk]) {
			actors[snk].next({ ...msg, src });
		}
	};

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

	return {
		spawn: makeSpawn(""),
		dispatch: makeDispatch(""),
		next: () =>
			new Promise((done) => {
				doNext = done;
			}),
	};
}
