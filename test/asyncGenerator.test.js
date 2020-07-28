import "babel-polyfill";
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
			const msg = yield;

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

	it("will communicate with transports", (done) => {
		const mockFetchSelective = jest.fn();
		let replyFromDb = () => {};

		function selectiveTransport(dispatch) {
			replyFromDb = dispatch;
			return {
				match: ({ src, msg, snk }) => snk.startsWith("database@"),
				handle: ({ src, msg, snk }) =>
					mockFetchSelective(
						`actor/${snk.replace("database@", "")}`,
						{
							body: msg,
						},
					),
			};
		}

		async function* networkEnabledActor({ dispatch, parent }) {
			const msg1 = yield;
			dispatch("database@users", {
				type: "QUERY",
				userId: 123,
				respondWith: "RESPONSE",
			});
			dispatch(parent, { type: "STARTED_QUERY" });

			const msg2 = yield;
			dispatch(parent, { type: "RESPONSE", msg: msg2 });
		}

		createActorSystem({
			transports: [selectiveTransport],
		})(async function* testActor({ spawn, dispatch }) {
			const netActor = spawn(networkEnabledActor);
			dispatch(netActor, { type: "ASK_FOR_USER" });

			yield;

			expect(mockFetchSelective).toHaveBeenCalledWith(`actor/users`, {
				body: { type: "QUERY", userId: 123, respondWith: "RESPONSE" },
			});

			// ------------------------------

			replyFromDb({
				snk: netActor,
				src: "database@user",
				msg: { type: "RESPONSE", userEnabled: true },
			});

			const output = yield;

			expect(output).toEqual({
				type: "RESPONSE",
				msg: {
					type: "RESPONSE",
					userEnabled: true,
					src: "database@user",
				},
				src: netActor,
			});
			done();
		});
	});
});
