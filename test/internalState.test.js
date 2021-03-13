import "babel-polyfill";
import createActorSystem from "../src";

function pause() {
	return new Promise((x) => setTimeout(x, Math.random() * 10));
}

async function* countingActor({ dispatch }, name) {
	const state = {
		count: 0,
	};

	while (true) {
		const msg = yield;

		//by getting the value before the wait, and using it after the wait,
		//we're opening ourselves up to race conditions if async generators don't properly enqueue messages
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
			default:
				continue;
		}
	}
}

it("will update its internal state", (done) => {
	createActorSystem()(async function* testActor({ spawn, dispatch }) {
		const counter = spawn(countingActor, "count VonCount");

		dispatch(counter, { type: "INC" });
		dispatch(counter, { type: "INC" });
		dispatch(counter, { type: "DEC" });
		dispatch(counter, { type: "INC" });
		dispatch(counter, { type: "QUERY" });

		const msg = yield;

		expect(msg).toEqual({
			type: "RESPONSE",
			name: "count VonCount",
			count: 2,
			src: counter,
		});

		done();
	});
});
