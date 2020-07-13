import { mountRoot, defineActor } from "../src";

describe("arguments -> name", () => {
	const myNameActor = defineActor(
		(x, y) => ["my-name", x, y].join("-"),
		(msg, { sender, dispatch, self, getName, args }) => {
			if (msg.type === "QUERY") {
				dispatch(sender, {
					type: "REPONSE",
					name: getName(self),
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
		const system = mountRoot(rootActor);

		system.dispatch({ type: "QUERY" });

		const { value: response } = await system.stream().next();

		expect(response).toEqual({
			type: "RESPONSE",
			name: "my-name-foo-bar",
			args: ["foo", "bar"],
		});
	});
});
