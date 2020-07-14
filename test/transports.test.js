import { createSystem, defineActor } from "../src";

describe("transports", () => {
	const rootActor = defineActor(
		"root",
		{},
		(state, msg, { dispatch, parent, sender, self }) => {
			switch (msg.type) {
				case "INTOSPECT":
					dispatch(parent, { type: "META", self });
					return;
				case "FROM_TRANSPORT":
					dispatch(parent, { type: "FORWARD", msg, sender });
					return;
			}
		},
	);

	it("will recieve incoming messages from transports", async () => {
		const mockFetch = jest.fn();
		let trigger = null;

		function permissiveTransport(dispatch) {
			trigger = ({ src, msg, snk }) => dispatch({ src, msg, snk });

			return {
				match: ({ src, msg, snk }) => true,
				handle: ({ src, msg, snk }) =>
					mockFetch(`actor/${snk}`, { body: msg }),
			};
		}

		const system = createSystem({
			root: rootActor,
			transports: {
				permissiveTransport,
			},
		});

		system.dispatch({ type: "INTOSPECT" });

		const { self: rootId } = await system.next();

		trigger({
			src: "mock-remote-actor",
			snk: rootId,
			msg: { type: "FROM_TRANSPORT", payload: "hello tod" },
		});

		const response = await system.next();

		expect(response).toEqual({
			type: "FORWARD",
			sender: "mock-remote-actor",
			msg: { type: "FROM_TRANSPORT", payload: "hello tod" },
		});
	});

	it("will delegate matching messages to transports", () => {});

	it("will use all matching transport", () => {});

	it("will not delegate to a transport if this system already contains the actor", () => {});
});
