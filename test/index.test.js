import { mountRoot, defineActor } from "../src";

describe("ingrates", () => {
	describe("root", () => {
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

	describe("heirarchy", () => {
		function createActors() {
			const mockConsole = jest.fn();

			const rootActor = defineActor(
				"root",
				(msg, { dispatch, spawn, children }) => {
					const logger =
						children.get("logger") ?? spawn("logger", loggerActor);
					const calculator =
						children.get("calculator") ??
						spawn("calculator", calculatorActor);

					switch (msg.type) {
						case "__INIT__":
							dispatch(calculator, { type: "INTRO", logger });
							dispatch(calculator, {
								type: "ADD",
								lhs: 2,
								rhs: 3,
							});
							break;

						case "RESULT":
							dispatch(logger, {
								type: "LOG",
								payload: `result: "${msg.result}"`,
							});
							break;
					}
				},
			);

			const loggerActor = defineActor(
				"logger",
				(msg, { sender, getName }) => {
					mockConsole(
						`message from ${getName(sender)} : ${msg.payload}`,
					);
				},
			);

			const calculatorActor = defineActor(
				"calculator",
				(msg, { dispatch, friends, parent }) => {
					switch (msg.type) {
						case "INTRO":
							const { logger } = msg;
							friends.add("logger", logger);
							break;

						case "ADD":
							const { lhs, rhs } = msg;
							const result = lhs + rhs;
							dispatch(friends.get("logger"), {
								type: "LOG",
								payload: `lhs: "${lhs}"`,
							});
							dispatch(friends.get("logger"), {
								type: "LOG",
								payload: `rhs: "${rhs}"`,
							});
							dispatch(parent, { type: "RESULT", result });
							break;
					}
				},
			);

			return { rootActor, mockConsole };
		}

		it("will log correct outputs", async () => {
			const { rootActor, mockConsole } = createActors();

			const system = mountRoot(rootActor);

			await new Promise((done) => setImmediate(done));

			expect(mockConsole).toHaveBeenCalledWith(
				'message from calculator : lhs: "2"',
			);
			expect(mockConsole).toHaveBeenCalledWith(
				'message from calculator : rhs: "3"',
			);
			expect(mockConsole).toHaveBeenCalledWith(
				'message from root : result: "5"',
			);
		});
	});

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
});
