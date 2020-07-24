import defineSystem from "../src";

describe("arguments -> name", () => {
	function myNameActor(state, msg, { sender, dispatch, name, args }, x, y) {
		if (msg.type === "QUERY") {
			dispatch(sender, {
				type: "RESPONSE",
				name,
				x,
				y,
			});
		}
	}
	myNameActor.name = (x, y) => ["my-name", x, y].join("-");

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
			name: "my-name-foo-bar",
			x: "foo",
			y: "bar",
		});
	});
});
