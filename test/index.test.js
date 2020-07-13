import { createSystem, defineActor } from "../src";

describe("basic api", () => {
	const rootActor = defineActor(
		"root",
		{},
		(state, msg, { dispatch, parent }) => {
			if (msg.type === "TEST_MSG") {
				dispatch(parent, { type: "TEST_RESPONSE" });
			}
		},
	);

	it("can create a system", () => {
		const system = createSystem({ root: rootActor });
	});

	it("can dispatch a messge into the system", (done) => {
		const system = createSystem({ root: rootActor });
		system.dispatch({
			type: "TEST_MSG",
		});

		setTimeout(done, 100);
	});

	it("can subscribe to messages coming out of the system", (done) => {
		const system = createSystem({ root: rootActor });
		system.subscribe((msg) => {
			expect(msg).toEqual({ type: "TEST_RESPONSE" });

			done();
		});

		system.dispatch({
			type: "TEST_MSG",
		});
	});

	it("can return a stream of output msgs", async () => {
		const system = createSystem({ root: rootActor });

		system.dispatch({ type: "TEST_MSG" });
		system.dispatch({ type: "TEST_MSG" });
		system.dispatch({ type: "TEST_MSG" });

		let count = 0;

		for await (const msg of system.stream()) {
			count++;
			expect(msg).toEqual({ type: "TEST_RESPONSE" });
		}

		expect(count).toBe(3);
	});
});
