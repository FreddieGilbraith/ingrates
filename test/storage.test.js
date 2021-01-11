import "babel-polyfill";
import createActorSystem from "../src";

describe("storage", () => {
	it("will let the storage engine know about changes to actors", (done) => {
		const onChange = jest.fn();

		function* rootActor({ dispatch, spawn, parent }) {
			const child = spawn(replyAndDieActor, "Peter");
			dispatch(child, { type: "SOUND_OFF" });

			const msg = yield { count: 1 };
			yield msg;

			dispatch(parent, { child });

			return;
		}

		function* replyAndDieActor({ dispatch }, name) {
			const msg = yield { name };

			dispatch(msg.src, { ...msg, name });
			dispatch(msg.src, { ...msg, name });

			return;
		}

		async function storageRealizer() {
			return onChange;
		}

		createActorSystem({ realizers: [storageRealizer] }).then((x) =>
			x(async function* testActor({ self, spawn }) {
				const root = spawn(rootActor);

				const { child } = yield;

				// empty the microevent queue so the root actor can exit
				await new Promise((x) => setTimeout(x, 0));

				// spawn myself
				expect(onChange).toHaveBeenCalledWith("spawn", {
					parent: null,
					self: self,
					gen: testActor,
					args: [],
				});

				// spawn root
				expect(onChange).toHaveBeenCalledWith("spawn", {
					parent: self,
					self: root,
					gen: rootActor,
					args: [],
				});

				// spawn child
				expect(onChange).toHaveBeenCalledWith("spawn", {
					parent: root,
					self: child,
					gen: replyAndDieActor,
					args: ["Peter"],
				});

				// root publish state
				expect(onChange).toHaveBeenCalledWith("publish", {
					id: root,
					value: { count: 1 },
				});
				expect(onChange).toHaveBeenCalledWith("publish", {
					id: root,
					value: {
						src: root,
						type: "SOUND_OFF",
						name: "Peter",
					},
				});

				// child publish state
				expect(onChange).toHaveBeenCalledWith("publish", {
					id: child,
					value: { name: "Peter" },
				});

				expect(onChange).toHaveBeenCalledWith("stop", { id: child });
				expect(onChange).toHaveBeenCalledWith("stop", { id: root });

				done();
			}),
		);
	});

	it("will recreate the actor system when storage() is first called", (done) => {
		expect.assertions(2);

		function* statefulActor({ self, parent, dispatch, state }, name) {
			while (true) {
				const msg = yield state;
				switch (msg.type) {
					case "INC":
						state.value++;
						break;
					case "DEC":
						state.value--;
						break;
					case "QUERY":
						dispatch(msg.src, {
							type: "RESPONSE",
							value: state.value,
							counter: self,
						});
						break;
				}
			}
		}

		function* rootActor({ self, parent, dispatch, spawn, state }, name) {
			state.counterChild = state.counterChild || spawn(statefulActor);

			dispatch(state.counterChild, { type: "INC" });
			dispatch(state.counterChild, { type: "INC" });
			dispatch(state.counterChild, { type: "QUERY" });

			const response = yield state;

			dispatch(parent, { ...response, src: self });
		}

		function* testActor({ spawn, self }) {
			expect(self).toBe("test-actor");

			const msg = yield;

			expect(msg).toEqual({
				src: "root-actor",
				type: "RESPONSE",
				value: 5,
				counter: "counter-actor",
			});

			done();
		}

		async function storageRealizer(spawnActor) {
			spawnActor(
				{
					parent: null,
					state: null,
					self: "test-actor",
				},
				testActor,
			);

			spawnActor(
				{
					parent: "test-actor",
					state: { counterChild: "counter-actor" },
					self: "root-actor",
				},
				rootActor,
			);

			spawnActor(
				{
					parent: "root-actor",
					state: { value: 3 },
					self: "counter-actor",
				},
				statefulActor,
			);

			return () => {};
		}

		createActorSystem({ realizers: [storageRealizer] });
	});
});
