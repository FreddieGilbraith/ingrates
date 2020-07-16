import { createSystem, defineActor } from "../src";

describe("arguments -> name", () => {
	const myNameActor = defineActor(
		(x, y) => ["my-name", x, y].join("-"),
		(msg, { sender, dispatch, name, args }) => {
			if (msg.type === "QUERY") {
				dispatch(sender, {
					type: "RESPONSE",
					name,
					args,
				});
			}
		},
	);

	const rootActor = defineActor("root", (msg, { forward, spawn }) => {
		if (msg.type === "QUERY") {
			const child = spawn("child", myNameActor, "foo", "bar");

			forward(child);
		}
	});

	it("responds with its name and arguments", async () => {
		const system = createSystem({ root: rootActor });

		system.dispatch({ type: "QUERY" });

		const response = await system.next();

		expect(response).toEqual({
			type: "RESPONSE",
			name: "my-name-foo-bar",
			args: ["foo", "bar"],
		});
	});
});
