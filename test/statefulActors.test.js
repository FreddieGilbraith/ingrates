import { mountRoot, defineActor } from "../src";

describe("stateful actors", () => {
	const counterActor = defineActor(
		"counter",
		(state = { count: 0 }, msg, { dispatch, sender }) => {
			switch (msg.type) {
				case "INC":
					return {
						...state,
						count: state.count + 1,
					};
				case "DEC":
					return R.over(R.lensProp("count"), R.dec);

				case "NOOP":
					break;

				case "QUERY":
					dispatch(sender, {
						type: "STORED_VALUE",
						count: state.count,
					});
			}
		},
	);

	it("will use default state", async () => {
		const system = mountRoot(counterActor);

		system.dispatch({ type: "QUERY" });

		const { value: response } = await system.stream().next();

		expect(response).toEqual({ type: "STORED_VALUE", count: 0 });
	});

	it("will update state from a returned value", async () => {
		const system = mountRoot(counterActor);

		system.dispatch({ type: "INC" });
		system.dispatch({ type: "INC" });
		system.dispatch({ type: "INC" });
		system.dispatch({ type: "QUERY" });

		const { value: response } = await system.stream().next();

		expect(response).toEqual({ type: "STORED_VALUE", count: 3 });
	});

	it("will update state from a returned update function", async () => {
		const system = mountRoot(counterActor);

		system.dispatch({ type: "DEC" });
		system.dispatch({ type: "DEC" });
		system.dispatch({ type: "DEC" });
		system.dispatch({ type: "QUERY" });

		const { value: response } = await system.stream().next();

		expect(response).toEqual({ type: "STORED_VALUE", count: -3 });
	});

	it("will maintain state if undefined is returned", async () => {
		const system = mountRoot(counterActor);

		system.dispatch({ type: "INC" });
		system.dispatch({ type: "INC" });
		system.dispatch({ type: "NOOP" });
		system.dispatch({ type: "QUERY" });

		const { value: response } = await system.stream().next();

		expect(response).toEqual({ type: "STORED_VALUE", count: 2 });
	});
});
