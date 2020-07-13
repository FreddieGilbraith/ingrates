import { mountRoot, defineActor } from "../src";

describe("basic api", () => {
	const rootActor = defineActor(
		"root",
		async (state = {}, msg, { dispatch, parent }) => {
			if (msg.type === "TEST_MSG") {
				dispatch(parent, { type: "TEST_RESPONSE" });
			}
		},
	);

	it("can create a system", () => {
		const system = mountRoot(rootActor);
	});

	it("can dispatch a messge into the system", () => {
		const system = mountRoot(rootActor);
		system.dispatch({
			type: "TEST_MSG",
		});
	});

	it("can subscribe to messages coming out of the system", () => {
		const system = mountRoot(rootActor);
		system.subscribe((msg) => {});
	});

	it("can query the state of the root actor", () => {
		const system = mountRoot(rootActor);

		expect(system.getState()).toEqual({});
	});

	it("can return a stream of output msgs", async () => {
		const system = mountRoot(rootActor);

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
