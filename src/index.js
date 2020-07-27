import { nanoid } from "nanoid";

function noop() {}

export default function createActorSystem(rootActor, { transports = {} } = {}) {
	const actors = {};

	const makeDispatch = (src) => (snk, msg) => {
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
	};
}
