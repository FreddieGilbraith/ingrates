import { performance } from "perf_hooks";
import "babel-polyfill";
import createActorSystem from "../src";

describe("performance", () => {
	it("can go fast", (done) => {
		const actorStarted = jest.fn();

		function* RecursiveSumActor({ spawn, dispatch, parent }) {
			actorStarted();

			let value = null;

			running: while (true) {
				const msg = yield;

				switch (msg.type) {
					case "PLEASE_DOUBLE":
						if (msg.value < 2) {
							dispatch(parent, {
								type: "RESULT",
								value: msg.value * 2,
							});
							break running;
						}

						const c1 = spawn(RecursiveSumActor);
						const c2 = spawn(RecursiveSumActor);
						dispatch(c1, {
							type: "PLEASE_DOUBLE",
							value: Math.floor(msg.value / 2),
						});
						dispatch(c2, {
							type: "PLEASE_DOUBLE",
							value: Math.ceil(msg.value / 2),
						});
						break;

					case "RESULT":
						if (value === null) {
							value = msg.value;
							break;
						} else {
							dispatch(parent, {
								type: "RESULT",
								value: value + msg.value,
							});
							break running;
						}
					default:
						continue;
				}
			}
		}

		createActorSystem()(function* TestActor({ spawn, dispatch }) {
			const summer = spawn(RecursiveSumActor);

			const value = Math.pow(2, 11);
			dispatch(summer, { type: "PLEASE_DOUBLE", value });

			const start = performance.now();
			const msg = yield;
			const end = performance.now();

			const duration = end - start;

			expect(msg.value).toBe(value * 2);
			expect(actorStarted).toHaveBeenCalledTimes(value * 2 - 1);

			console.log(
				"ran",
				value * 2 - 1,
				"actors; in",
				Math.round(duration),
				"ms",
			);

			expect(duration < 3000).toBe(true);

			done();
		});
	});
});
