import defineSystem from "../src";

describe("persistence", () => {
	function statefulChildActor(
		state = { count: 0 },
		msg,
		{ dispatch, self, parent, sender },
	) {
		if (msg.type === "INC") {
			return { count: state.count++ };
		}

		if (msg.type === "QUERY") {
			dispatch(sender, { type: "RESPONSE", self, state, parent });
		}
	}

	function pirateActor(
		state,
		msg,
		{ dispatch, self, friends, parent, sender },
		...args
	) {
		if (msg.type === "INTRO") {
			friends.set("buddy", msg.addr);
		}

		if (msg.type === "QUERY") {
			const as = {};
			for (const [key, val] of friends.entries()) {
				as[key] = val;
			}
			dispatch(sender, {
				type: "RESPONSE",
				self,
				args,
				parent,
				friends: as,
			});
		}
	}

	function rootActor(
		state,
		msg,
		{ dispatch, children, spawn, self, parent, sender },
	) {
		if (msg.type === "QUERY") {
			const as = {};
			for (const [key, val] of children.entries()) {
				as[key] = val;
			}

			dispatch(sender, { type: "RESPONSE", self, children: as, parent });
		}
	}

	describe("serialise", () => {
		it.todo("can list all the currently running actor ids");
		it.todo("can output the current actor heirarchy");
		it.todo("can output the args of any specified actor");
		it.todo("can output the state of any specified actor");
	});

	describe("deserialise", () => {
		it("will create a new actor system given a list of ids and their states", async () => {
			const getActorDefinition = (id) =>
				({
					"root-id": rootActor,
					"pirate-id": pirateActor,
					"state-id": statefulChildActor,
				}[id]);

			const getState = async (id) =>
				id === "state-id" ? Promise.resolve({ count: 5 }) : null;

			const getArgs = async (id) =>
				id === "pirate-id"
					? Promise.resolve(["foo", "bar", true])
					: null;

			const getChildren = async (id) =>
				({
					"": ["root-id"],
					"root-id": Promise.resolve(
						new Map([
							["arkansas", "state-id"],
							["blackBeard", "pirate-id"],
						]),
					),
				}[id]);

			const getFriends = async (id) =>
				id === "pirate-id"
					? Promise.resolve(new Map([["buddy", "state-id"]]))
					: null;

			const system = await defineSystem({
				loaders: {
					getActorDefinition,
					getArgs,
					getChildren,
					getFriends,
					getState,
				},
			}).rehydrate(rootActor);

			const response1 = await system.dispatch("root-id", {
				type: "QUERY",
			});
			expect(response1).toEqual({
				src: "root-id",
				msg: {
					type: "RESPONSE",
					self: "root-id",
					parent: "",
					children: { arkansas: "state-id", blackBeard: "pirate-id" },
				},
			});

			const response2 = await system.dispatch("pirate-id", {
				type: "QUERY",
			});

			expect(response2).toEqual({
				src: "pirate-id",
				msg: {
					type: "RESPONSE",
					self: "pirate-id",
					args: ["foo", "bar", true],
					parent: "root-id",
					friends: {
						buddy: "state-id",
					},
				},
			});

			const response3 = await system.dispatch("state-id", {
				type: "QUERY",
			});

			expect(response3).toEqual({
				src: "state-id",
				msg: {
					type: "RESPONSE",
					self: "state-id",
					parent: "root-id",
					state: {
						count: 5,
					},
				},
			});
		});
	});
});
