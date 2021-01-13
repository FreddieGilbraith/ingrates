import "babel-polyfill";
import createActorSystem from "../src";

import { flushPromises, pause, queryEnhancer } from "./utils";

describe("shutdown", () => {
	test("actors should shutdown when their parents shutdown", (done) => {
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

					case "KILL": {
						break;
					}
				}
			}
		}

		createActorSystem({ enhancers: [queryEnhancer] })(
			async function* TestActor({ spawn, dispatch, query }) {
				const bob = spawn(Bob);
				const { addr: eve } = await query(bob, {
					type: "REQUEST_EVE_ADDRESS",
				});

				const response1 = await query(eve, { type: "PING" });
				expect(response1.type).toBe("PONG");

				dispatch(bob, { type: "KILL" });

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

	test.todo("actors should shutdown when their grandparents shutdown");
});
