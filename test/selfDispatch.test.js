import "babel-polyfill";
import createActorSystem from "../src";

describe("self dispatch", () => {
	it("can dispatch to itself", (done) => {
		function* recursiveSelfCallingActor({ dispatch, self, parent }) {
			let running = true;

			while (running) {
				const msg = yield;

				if (msg.i === 0) {
					running = false;

					dispatch(parent, { type: "DONE", x: msg.x });
				} else {
					dispatch(self, { ...msg, i: msg.i - 1, x: msg.x * 2 });
				}
			}
		}

		createActorSystem()(function* testActor({ spawn, dispatch }) {
			const child = spawn(recursiveSelfCallingActor);

			dispatch(child, { i: 5, x: 1 });

			const response = yield;

			expect(response).toMatchObject({
				type: "DONE",
				x: 32,
			});

			done();
		});
	});

	it("can re-dispatch the current msg to itself", (done) => {
		function* onlyResponseOnceSeenTwiceActor({ dispatch, parent, self }) {
			let running = true;
			let seenMessage = false;

			while (running) {
				const msg = yield;

				if (!seenMessage) {
					seenMessage = true;
					dispatch(self, msg);
					continue;
				} else {
					dispatch(parent, { type: "DONE" });
					running = false;
				}
			}
		}

		createActorSystem()(function* testActor({ spawn, dispatch }) {
			const child = spawn(onlyResponseOnceSeenTwiceActor);

			dispatch(child, {});

			const response = yield;

			expect(response).toMatchObject({
				type: "DONE",
			});

			done();
		});
	});

	test("self-re-dispatched msgs go to the back of the queue", (done) => {
		function* signingActor({ dispatch, parent, self }) {
			let running = true;
			let buffer = [];

			while (running) {
				const msg = yield;

				if (!msg.signed) {
					dispatch(self, {
						...msg,
						signed: true,
					});
					dispatch(self, {
						...msg,
						signed: true,
						carbonCopy: true,
					});
					continue;
				} else {
					if (msg.type === "RESPOND") {
						dispatch(parent, { type: "RESPONSE", buffer });
						running = false;
						continue;
					} else {
						buffer.push(msg);
					}
				}
			}
		}

		createActorSystem()(function* testActor({ spawn, dispatch }) {
			const child = spawn(signingActor);

			dispatch(child, { i: 1 });
			dispatch(child, { i: 2 });
			dispatch(child, { type: "RESPOND" });

			const response = yield;

			expect(response).toMatchObject({
				type: "RESPONSE",
				buffer: [
					{ i: 1 },
					{ i: 1, carbonCopy: true },
					{ i: 2 },
					{ i: 2, carbonCopy: true },
				],
			});

			done();
		});
	});
});
