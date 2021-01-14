import "babel-polyfill";
import createActorSystem from "../src";

import { flushPromises, sleep, pause, queryEnhancer } from "./utils";

describe("shutdown", () => {
	test("actors should shutdown when their parents shutdown gracefully", (done) => {
		expect.assertions(2);

		function* Eve({ dispatch }) {
			while (true) {
				const msg = yield;
				if (msg.type === "PING") {
					dispatch(msg.src, { type: "PONG" });
				}
			}
		}

		function* Bob({ spawn, dispatch }) {
			let running = true;
			const eve = spawn(Eve);

			while (running) {
				const msg = yield;
				switch (msg.type) {
					case "REQUEST_EVE_ADDRESS": {
						dispatch(msg.src, {
							type: "RESPONSE_EVE_ADDRESS",
							addr: eve,
						});
						break;
					}

					case "STOP": {
						running = false;
						break;
					}
				}
			}
		}

		createActorSystem({
			enhancers: [queryEnhancer],
		})(async function* TestActor({ spawn, dispatch, query }) {
			const bob = spawn(Bob);
			const { addr: eve } = await query(bob, {
				type: "REQUEST_EVE_ADDRESS",
			});

			const response1 = await query(eve, { type: "PING" });
			expect(response1.type).toBe("PONG");

			dispatch(bob, { type: "STOP" });

			await flushPromises();

			try {
				const response1 = await query(eve, { type: "PING" });
				done("Fail: Eve was still queryable");
			} catch (e) {
				expect(e.type).toBe("QUERY_TIMEOUT");
				done();
			}
		});
	});

	test("actors should shutdown when their grandparents shutdown gracefully", (done) => {
		function* Eve({ dispatch }) {
			while (true) {
				const msg = yield;
				if (msg.type === "PING") {
					dispatch(msg.src, { type: "PONG" });
				}
			}
		}

		function* Bob({ spawn, dispatch }) {
			const eve = spawn(Eve);

			while (true) {
				const msg = yield;
				switch (msg.type) {
					case "REQUEST_EVE_ADDRESS": {
						dispatch(msg.src, {
							type: "RESPONSE_EVE_ADDRESS",
							addr: eve,
						});
					}
				}
			}
		}

		async function* Alice({ spawn, dispatch, query }) {
			let running = true;
			const bob = spawn(Bob);
			const { addr: eve } = await query(bob, {
				type: "REQUEST_EVE_ADDRESS",
			});

			while (running) {
				const msg = yield;
				switch (msg.type) {
					case "REQUEST_EVE_ADDRESS": {
						dispatch(msg.src, {
							type: "RESPONSE_EVE_ADDRESS",
							addr: eve,
						});
						break;
					}

					case "STOP": {
						running = false;
						break;
					}
				}
			}
		}

		createActorSystem({ enhancers: [queryEnhancer] })(
			async function* TestActor({ spawn, dispatch, query }) {
				const alice = spawn(Alice);
				const { addr: eve } = await query(alice, {
					type: "REQUEST_EVE_ADDRESS",
				});

				const response1 = await query(eve, { type: "PING" });
				expect(response1.type).toBe("PONG");

				dispatch(alice, { type: "STOP" });

				await flushPromises();

				try {
					const response1 = await query(eve, { type: "PING" });
					done("Fail: Eve was still queryable");
				} catch (e) {
					expect(e.type).toBe("QUERY_TIMEOUT");
					done();
				}
			},
		);
	});

	test("actors should shutdown when their parents crash", (done) => {
		expect.assertions(2);

		function* Eve({ dispatch }) {
			while (true) {
				const msg = yield;
				if (msg.type === "PING") {
					dispatch(msg.src, { type: "PONG" });
				}
			}
		}

		function* Zed({ spawn, dispatch }) {
			let running = true;
			const eve = spawn(Eve);

			while (running) {
				const msg = yield;
				switch (msg.type) {
					case "REQUEST_EVE_ADDRESS": {
						dispatch(msg.src, {
							type: "RESPONSE_EVE_ADDRESS",
							addr: eve,
						});
						break;
					}

					case "KILL": {
						throw new Error("Zed's dead, Baby");
					}
				}
			}
		}

		createActorSystem({
			enhancers: [queryEnhancer],
			onErr: jest.fn(),
		})(async function* TestActor({ spawn, dispatch, query }) {
			const zed = spawn(Zed);
			const { addr: eve } = await query(zed, {
				type: "REQUEST_EVE_ADDRESS",
			});

			const response1 = await query(eve, { type: "PING" });
			expect(response1.type).toBe("PONG");

			dispatch(zed, { type: "KILL" });

			try {
				const response1 = await query(eve, { type: "PING" });
				done("Fail: Eve was still queryable");
			} catch (e) {
				expect(e.type).toBe("QUERY_TIMEOUT");
				done();
			}
		});
	});
});
