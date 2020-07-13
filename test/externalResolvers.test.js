import { mountRoot, defineActor } from "../src";

describe("externalResolvers", () => {
	const apiCallingActor = defineActor(
		"apiCaller",
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
		const { apiCallingActor, mockConsole } = createActors();

		const system = mountRoot(apiCallingActor);

		const incoming = system.addExternaResolver({
			addr: "api-actor-addr",
			name: "Api Actor",
			outgoing: (msg) => mockFetch(msg),
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
