import { performance } from "perf_hooks";
import "babel-polyfill";
import createActorSystem from "../src";

import { queryEnhancer } from "./utils";

const aBigNumber = Math.pow(2, 12);

describe("performance", () => {
	it("can spawn many actors", (done) => {
		function* ElNino({ dispatch, parent }, i) {
			dispatch(parent, {
				type: "HELLO",
				i,
			});
		}

		function* Papi({ parent, dispatch, spawn }) {
			for (let i = 0; i < aBigNumber; i++) {
				spawn(ElNino, i);
			}

			let acc = 0;
			while (acc < aBigNumber) {
				const msg = yield;
				acc++;
			}

			dispatch(parent, "DONE");
		}

		createActorSystem()(function* TestActor({ spawn, dispatch }) {
			spawn(Papi);

			const start = performance.now();
			yield;
			const end = performance.now();

			const duration = end - start;

			console.log(
				"spawned",
				aBigNumber,
				"actors; in",
				Math.round(duration),
				"ms",
			);

			expect(duration).toBeLessThan(3000);

			done();
		});
	});

	it("can send many messages", (done) => {
		function* LaNina({ dispatch, parent }) {
			while (true) {
				const { i } = yield;
				dispatch(parent, {
					i: i + 1,
				});
			}
		}

		function* Papi({ parent, dispatch, spawn }) {
			const laNina = spawn(LaNina);

			let acc = 0;
			while (acc < aBigNumber) {
				dispatch(laNina, { i: acc });
				const { i } = yield;
				acc = i;
			}

			dispatch(parent, "DONE");
		}

		createActorSystem()(function* TestActor({ spawn, dispatch }) {
			spawn(Papi);

			const start = performance.now();
			yield;
			const end = performance.now();

			const duration = end - start;

			console.log(
				"sent",
				aBigNumber,
				"messages; in",
				Math.round(duration),
				"ms",
			);

			expect(duration).toBeLessThan(3000);

			done();
		});
	});

	it("can go fast", (done) => {
		const actorStarted = jest.fn();

		function* RecursiveSumActor({ spawn, dispatch, parent }) {
			actorStarted();

			let value = null;
			let running = true;

			while (running) {
				const msg = yield;

				switch (msg.type) {
					case "PLEASE_DOUBLE":
						if (msg.value < 2) {
							dispatch(parent, {
								type: "RESULT",
								value: msg.value * 2,
							});
							running = false;
							break;
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
							running = false;
							break;
						}
					default:
						continue;
				}
			}
		}

		createActorSystem()(function* TestActor({ spawn, dispatch }) {
			const summer = spawn(RecursiveSumActor);

			const value = aBigNumber / 2;
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

			expect(duration).toBeLessThan(3000);

			done();
		});
	});
});
