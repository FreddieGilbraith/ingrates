import { nanoid } from "nanoid";

function noop() {}

function createActorSystem(rootActor, { subscribe = noop } = {}) {
	const actors = {};

	const makeDispatch = (src) => (snk, msg) => {
		(actors[snk] ? actors.next : noop)({ ...msg, src });
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
		dispatch: makeDispatch("__EXTERNAL__"),
		root: makeSpawn("__EXTERNAL__")(rootActor),
	};
}

describe("", () => {
	function pause() {
		return new Promise((x) => setTimeout(x, Math.random() * 10));
	}

	async function* childActor({ spawn, dispatch }, name) {
		const state = {
			count: 0,
		};

		while (true) {
			const msg = yield state;

			//by getting the value before the wait, and using it after the wait, we're opening ourselves up to race conditions if async generators don't properly enqueue calls
			const count = state.count;

			await pause();

			switch (msg.type) {
				case "INC": {
					state.count = count + 1;
					continue;
				}
				case "DEC": {
					state.count = count - 1;
					continue;
				}
				case "QUERY": {
					dispatch(msg.src, {
						type: "RESPONSE",
						name,
						count: state.count,
					});
					continue;
				}
			}
		}
	}

	async function* rootActor({ dispatch, spawn, parent }) {
		const countingChild1 = spawn(childActor, "one");
		const countingChild2 = spawn(childActor, "two");

		dispatch(countingChild1, { type: "INC" });
		dispatch(countingChild1, { type: "INC" });
		dispatch(countingChild1, { type: "DEC" });
		dispatch(countingChild1, { type: "INC" });

		dispatch(countingChild1, { type: "QUERY" });

		while (true) {
			const msg = yield;
			dispatch(parent, { type: "OUTPUT", msg });
		}
	}

	it("does something", async () => {
		const { root, dispatch, subscribe, next } = createActorSystem(
			rootActor,
		);

		//const output = await new Promise(next);
		//console.log({ root, output });
	});
});
