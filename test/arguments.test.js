import defineSystem from "../src";

describe("arguments -> name", () => {
	function myNameActor(state, msg, { sender, dispatch }, x, y) {
		if (msg.type === "QUERY") {
			dispatch(sender, {
				type: "RESPONSE",
				x,
				y,
			});
		}
	}

	function rootActor(state, msg, { forward, spawn }) {
		if (msg.type === "QUERY") {
			const child = spawn("child", myNameActor, "foo", "bar");

			forward(child);
		}
	}

	it("responds with its name and arguments", async () => {
		const system = defineSystem().mount(rootActor);

		system.dispatch({ type: "QUERY" });

		const response = await system.next();

		expect(response).toEqual({
			type: "RESPONSE",
			x: "foo",
			y: "bar",
		});
	});
});
