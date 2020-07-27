import { nanoid } from "nanoid";

import createActorSystem from "../src";

describe("async generators", () => {
	function pause() {
		return new Promise((x) => setTimeout(x, Math.random() * 10));
	}

	async function* childActor({ spawn, dispatch }, name) {
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

	async function* rootActor({ dispatch, spawn, parent }) {
		const countingChild1 = spawn(childActor, "one");
		const countingChild2 = spawn(childActor, "two");
		let runs = 0;

		dispatch(countingChild1, { type: "INC" });
		dispatch(countingChild1, { type: "INC" });
		dispatch(countingChild1, { type: "DEC" });
		dispatch(countingChild1, { type: "INC" });

		dispatch(countingChild1, { type: "QUERY" });

		while (true) {
			const msg = yield;
			console.log(msg);
			dispatch(parent, { type: "OUTPUT", msg });
		}
	}

	it("does something", async () => {
		let next = () => {};
		const output = (envelope) => {
			console.log("output", envelope);
			next(envelope);
		};

		function selectiveTransport(dispatch) {
			return {
				match: ({ src, msg, snk }) => snk === "",
				handle: output,
			};
		}

		const { spawn, dispatch } = createActorSystem({});

		spawn(rootActor);

		await new Promise((x) => setTimeout(x, 100));

		//const outputMsg = await new Promise((done) => {
		//next = done;
		//});

		//console.log(outputMsg);
	});
});
