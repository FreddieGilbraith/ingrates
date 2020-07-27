import { nanoid } from "nanoid";

import createActorSystem from "../src";

describe("async generators", () => {
	function pause() {
		return new Promise((x) => setTimeout(x, Math.random() * 10));
	}

	async function* countingActor({ spawn, dispatch }, name) {
		const state = {
			count: 0,
		};

		while (true) {
			const msg = yield state;

			//by getting the value before the wait, and using it after the wait,
			//we're opening ourselves up to race conditions if async generators don't properly enqueue calls
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

	//function selectiveTransport(dispatch) {
	//return {
	//match: ({ src, msg, snk }) => snk.startsWith("database@"),
	//handle: ({ src, msg, snk }) =>
	//mockFetchSelective(`actor/${snk.replace("database@", "")}`, {
	//body: msg,
	//}),
	//};
	//}

	it("will update its internal state", async () => {
		const { spawn, dispatch, next } = createActorSystem({});

		const counter = spawn(countingActor, "count VonCount");

		dispatch(counter, { type: "INC" });
		dispatch(counter, { type: "INC" });
		dispatch(counter, { type: "DEC" });
		dispatch(counter, { type: "INC" });
		dispatch(counter, { type: "QUERY" });

		const { msg } = await next();

		expect(msg).toEqual({
			type: "RESPONSE",
			name: "count VonCount",
			count: 2,
		});
	});
});
