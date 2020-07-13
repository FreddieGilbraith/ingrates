import { createSystem, defineActor } from "../src";

describe.skip("externalResolvers", () => {
	const apiCallingActor = defineActor(
		"Api Caller",
		(msg, { sender, parent, getName, dispatch }) => {
			if (msg.type === "PLEASE_CALL_API") {
				dispatch("api-actor-addr", {
					type: "CALL",
					path: "/test/path",
				});
			}

			if (msg.type === "API_RESPONSE") {
				dispatch(parent, {
					type: "RESPONSE",
					body: msg.body,
					fromNamed: getName(sender),
				});
			}
		},
	);

	it("will pass messages to actors I don't manage to externalResolvers", async () => {
		const mockFetch = jest.fn();
		let incoming;

		const system = createSystem({
			root: apiCallingActor,
			transports: [
				(createTransport) => {
					incoming = createTransport((msg) => mockFetch(msg));
				},
			],
		});

		system.dispatch({ type: "PLEASE_CALL_API" });

		await new Promise((done) => setImmediate(done));

		expect(mockFetch).toHaveBeenCalledWith({
			type: "CALL",
			path: "/test/path",
		});

		// ---

		incoming({
			type: "API_RESPONSE",
			body: "this is the body",
		});

		const { value: response } = await system.stream().next();

		expect(response).toEqual({
			type: "RESPONSE",
			body: "this is the body",
			fromNamed: "Api Actor",
		});
	});
});
