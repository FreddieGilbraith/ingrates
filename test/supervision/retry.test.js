import test from "ava";
import * as R from "ramda";

import { createActorSystem } from "../../src/index.js";
import { sleep, flushPromises } from "../utils.js";

test("should introduce/increment the retry value to the actor meta", async (t) => {
	t.timeout(100);

	let finalStateValue = null;
	let supervisionCalledTimes = 0;

	const Actor = {
		Crash: () => {
			throw new Error("Should Retry");
		},

		Done: ({ state }) => {
			finalStateValue = true;
		},

		supervision: (error, meta, responses) => {
			supervisionCalledTimes++;

			if (meta.retry > 9) {
				return responses.resume;
			}

			return responses.retry;
		},
	};

	const system = createActorSystem({ onErr: () => {} });

	system.register(Actor);
	const addr = system.spawn(Actor);

	system.dispatch(addr, { type: "Crash" });
	system.dispatch(addr, { type: "Done" });

	while (!finalStateValue) {
		await flushPromises();
	}

	t.is(supervisionCalledTimes, 11);
});

test("will re-process a message after retrying from an error", async (t) => {
	t.timeout(100);

	let finalStateValue = null;
	let supervisionCalledTimes = 0;

	const Actor = {
		Inc: () => {
			return R.over(R.lensProp("counter"), R.pipe(R.defaultTo(0), R.inc));
		},

		CrashOnce: ({ retry }) => {
			if (!retry) {
				throw new Error("Should Retry");
			}
		},

		Query: ({ state }) => {
			finalStateValue = state.counter;
		},

		supervision: (error, meta, responses) => {
			supervisionCalledTimes++;

			if (meta.retry > 9) {
				return responses.resume;
			}

			return responses.retry;
		},
	};

	const system = createActorSystem({ onErr: () => {} });

	system.register(Actor);
	const addr = system.spawn(Actor);

	system.dispatch(addr, { type: "Inc" });
	system.dispatch(addr, { type: "CrashOnce" });
	system.dispatch(addr, { type: "Inc" });
	system.dispatch(addr, { type: "Query" });

	while (!finalStateValue) {
		await flushPromises();
	}

	t.is(supervisionCalledTimes, 1);
});

test("should re-attempt the message that created the error before any others", async (t) => {
	t.timeout(100);

	let finalStateValue = null;
	const msgs = [];

	function Actor({ retry, state, msg }) {
		msgs.push(msg.type);

		switch (msg.type) {
			case "Inc":
				return R.over(R.lensProp("counter"), R.pipe(R.defaultTo(0), R.inc));

			case "CrashOnce": {
				if (!retry) {
					throw new Error("Should Retry");
				} else {
					break;
				}
			}

			case "Query": {
				finalStateValue = state.counter;
				break;
			}
		}
	}

	Actor.supervision = (error, meta, responses) => {
		if (meta.retry > 9) {
			return responses.resume;
		}

		return responses.retry;
	};

	const system = createActorSystem({ onErr: () => {} });

	system.register(Actor);
	const addr = system.spawn(Actor);

	system.dispatch(addr, { type: "Inc" });
	system.dispatch(addr, { type: "CrashOnce" });
	system.dispatch(addr, { type: "Inc" });
	system.dispatch(addr, { type: "Query" });

	while (!finalStateValue) {
		await flushPromises();
	}

	t.deepEqual(msgs, [
		/**/
		"Start",
		"Mount",
		"Inc",
		"CrashOnce",
		"CrashOnce",
		"Inc",
		"Query",
	]);
});
