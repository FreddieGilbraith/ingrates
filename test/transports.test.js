import defineSystem from "../src";

function flushPromises() {
	return new Promise((done) => setImmediate(done));
}

describe("transports", () => {
	function childActor() {}

	function rootActor(state, msg, { dispatch, parent, sender, self, spawn }) {
		switch (msg.type) {
			case "INTOSPECT":
				dispatch(parent, { type: "META", self });
				return;
			case "FROM_TRANSPORT":
				dispatch(parent, { type: "FORWARD", msg, sender });
				return;
			case "QUERY_DB":
				dispatch("database@users", {
					type: "QUERY",
					payload: { userId: 123 },
				});
				dispatch("logs@users", {
					type: "ACCESS",
					payload: { userId: 123 },
				});
			case "MAKE_CHILD":
				const child = spawn("child", childActor);
				dispatch(child, {
					type: "AFFIRMATION",
					msg: "you are valid and worthy of love",
				});
				return;
		}
	}

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

		const system = defineSystem({
			transports: {
				permissiveTransport,
			},
		}).mount(rootActor);

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

	it("will delegate matching messages to transports", async () => {
		const mockFetch = jest.fn();

		function selectiveTransport(dispatch) {
			return {
				match: ({ src, msg, snk }) => snk.startsWith("database@"),
				handle: ({ src, msg, snk }) =>
					mockFetch(`actor/${snk.replace("database@", "")}`, {
						body: msg,
					}),
			};
		}

		const system = defineSystem({
			transports: {
				selectiveTransport,
			},
		}).mount(rootActor);

		system.dispatch({ type: "QUERY_DB" });

		await flushPromises();

		expect(mockFetch).toHaveBeenCalledTimes(1);
		expect(mockFetch).toHaveBeenCalledWith("actor/users", {
			body: { type: "QUERY", payload: { userId: 123 } },
		});
		expect(mockFetch).not.toHaveBeenCalledWith("actor/users", {
			body: { type: "ACCESS", payload: { userId: 123 } },
		});
	});

	it("will use all matching transport", async () => {
		const mockFetchSelective = jest.fn();
		function selectiveTransport(dispatch) {
			return {
				match: ({ src, msg, snk }) => snk.startsWith("database@"),
				handle: ({ src, msg, snk }) =>
					mockFetchSelective(
						`actor/${snk.replace("database@", "")}`,
						{
							body: msg,
						},
					),
			};
		}

		const mockFetchPermissive = jest.fn();
		function permissiveTransport(dispatch) {
			return {
				match: ({ src, msg, snk }) => true,
				handle: ({ src, msg, snk }) =>
					mockFetchPermissive(`actor/${snk}`, { body: msg }),
			};
		}

		const system = defineSystem({
			transports: {
				selectiveTransport,
				permissiveTransport,
			},
		}).mount(rootActor);

		system.dispatch({ type: "QUERY_DB" });

		await flushPromises();

		expect(mockFetchSelective).toHaveBeenCalledTimes(1);
		expect(mockFetchSelective).toHaveBeenCalledWith("actor/users", {
			body: { type: "QUERY", payload: { userId: 123 } },
		});
		expect(mockFetchSelective).not.toHaveBeenCalledWith("actor/users", {
			body: { type: "ACCESS", payload: { userId: 123 } },
		});

		expect(mockFetchPermissive).toHaveBeenCalledTimes(2);
		expect(mockFetchPermissive).toHaveBeenCalledWith(
			"actor/database@users",
			{
				body: { type: "QUERY", payload: { userId: 123 } },
			},
		);
		expect(mockFetchPermissive).toHaveBeenCalledWith("actor/logs@users", {
			body: { type: "ACCESS", payload: { userId: 123 } },
		});
	});

	it("will not delegate to a transport if this system already contains the actor", async () => {
		const match = jest.fn();
		const handle = jest.fn();

		function mockTransport(dispatch) {
			return {
				match,
				handle,
			};
		}

		const system = defineSystem({
			transports: {
				mockTransport,
			},
		}).mount(rootActor);

		system.dispatch({ type: "MAKE_CHILD" });

		await flushPromises();

		expect(match).not.toHaveBeenCalled();
		expect(handle).not.toHaveBeenCalled();
	});
});
