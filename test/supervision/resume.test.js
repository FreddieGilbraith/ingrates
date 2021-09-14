import test from "ava";
import * as R from "ramda";

import { createActorSystem } from "../../src/index.js";
import { sleep, flushPromises } from "../utils.js";

test("should continue to process messages after resuming from an error", async (t) => {
	t.timeout(100);

	let finalStateValue = null;
	let incCalledTimes = 0;

	const Actor = {
		Inc: () => {
			incCalledTimes++;
			return R.over(R.lensProp("counter"), R.pipe(R.defaultTo(0), R.inc));
		},

		Crash: () => {
			throw new Error("Can Resume");
		},

		Query: ({ state }) => {
			finalStateValue = state.counter;
		},

		supervision: (error, meta, responses) => {
			t.is(error.message, "Can Resume");
			return responses.resume;
		},
	};

	const system = createActorSystem({ onErr: () => {} });

	system.register(Actor);
	const addr = system.spawn(Actor);

	system.dispatch(addr, { type: "Inc" });
	system.dispatch(addr, { type: "Inc" });
	system.dispatch(addr, { type: "Crash" });
	system.dispatch(addr, { type: "Inc" });
	system.dispatch(addr, { type: "Inc" });
	system.dispatch(addr, { type: "Query" });

	while (!finalStateValue) {
		await flushPromises();
	}

	t.is(incCalledTimes, 4);
});

test("will retain state after resuming from an error", async (t) => {
	t.timeout(100);

	let finalStateValue = null;

	const Actor = {
		Inc: () => {
			return R.over(R.lensProp("counter"), R.pipe(R.defaultTo(0), R.inc));
		},

		Crash: () => {
			throw new Error("Can Resume");
		},

		Query: ({ state }) => {
			finalStateValue = state.counter;
		},

		supervision: (error, meta, responses) => {
			t.is(error.message, "Can Resume");
			return responses.resume;
		},
	};

	const system = createActorSystem({ onErr: () => {} });

	system.register(Actor);
	const addr = system.spawn(Actor);

	system.dispatch(addr, { type: "Inc" });
	system.dispatch(addr, { type: "Inc" });
	system.dispatch(addr, { type: "Crash" });
	system.dispatch(addr, { type: "Inc" });
	system.dispatch(addr, { type: "Inc" });
	system.dispatch(addr, { type: "Query" });

	while (!finalStateValue) {
		await flushPromises();
	}

	t.is(finalStateValue, 4);
});
