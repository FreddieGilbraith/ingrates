import "babel-polyfill";

import { queryEnhancer, flushPromises } from "./utils";
import createActorSystem from "../src";

describe("supervision", () => {
	beforeEach(() => {
		jest.spyOn(console, "error").mockImplementation(() => {});
	});
	afterEach(() => {
		jest.resetAllMocks();
	});

	describe("general", () => {
		const supervisor = jest.fn();

		async function* CrashableActor({ dispatch, state = {} }) {
			while (true) {
				const msg = yield state;
				switch (msg.type) {
					case "PING":
						dispatch(msg.src, { type: "PONG" });
						state.timesPinged = (state.timesPinged || 0) + 1;
						break;
					case "KILL":
						throw new Error("I was told to crash");
					default:
						continue;
				}
			}
		}

		CrashableActor.supervision = supervisor;

		it("should recieve the provisions of the failed actor", (done) =>
			createActorSystem()(async function* testActor({ spawn, dispatch }) {
				expect.assertions(2);
				const crashable = spawn(CrashableActor);
				dispatch(crashable, { type: "KILL", meta: 123 });

				await flushPromises();

				expect(supervisor).toHaveBeenCalledTimes(1);
				expect(supervisor.mock.calls[0][0].self).toEqual(crashable);

				done();
			}));

		it("should recieve the message that caused the failure", (done) =>
			createActorSystem()(async function* testActor({
				spawn,
				dispatch,
				self,
			}) {
				expect.assertions(2);
				const crashable = spawn(CrashableActor);
				dispatch(crashable, { type: "KILL", meta: 123 });

				await flushPromises();

				expect(supervisor).toHaveBeenCalledTimes(1);
				expect(supervisor.mock.calls[0][1].msg).toEqual({
					src: self,
					type: "KILL",
					meta: 123,
				});

				done();
			}));

		it("should recieve the error that was thrown from the failure", (done) =>
			createActorSystem()(async function* testActor({ spawn, dispatch }) {
				expect.assertions(2);
				const crashable = spawn(CrashableActor);
				dispatch(crashable, { type: "KILL", meta: 123 });

				await flushPromises();

				expect(supervisor).toHaveBeenCalledTimes(1);
				expect(supervisor.mock.calls[0][1].err).toEqual(
					new Error("I was told to crash"),
				);

				done();
			}));

		it("should recieve the preceding state from the time of failure", (done) =>
			createActorSystem({ enhancers: [queryEnhancer] })(
				async function* testActor({ spawn, dispatch, query }) {
					expect.assertions(2);
					const crashable = spawn(CrashableActor);

					await query(crashable, { type: "PING" });
					await query(crashable, { type: "PING" });
					await query(crashable, { type: "PING" });

					dispatch(crashable, { type: "KILL", meta: 123 });

					await flushPromises();

					expect(supervisor).toHaveBeenCalledTimes(1);
					expect(supervisor.mock.calls[0][1].state).toEqual({
						timesPinged: 3,
					});

					done();
				},
			));
	});

	describe.skip("requeue", () => {
		async function* CrashableActor({ dispatch, state = { users: [] } }) {
			while (true) {
				const msg = yield state;

				console.log("CrashableActor", msg);
				switch (msg.type) {
					case "ADD_USER": {
						state[msg.userId] = { name: msg.userName };
						break;
					}

					case "GET_USER": {
						if (state[msg.userId]) {
							dispatch(msg.src, {
								type: "DESCRIBE_USER",
								userId: msg.userId,
								user: state[msg.userId],
							});
							break;
						} else {
							throw new Error("Requested undefined user");
						}
					}

					default:
						continue;
				}
			}
		}

		CrashableActor.supervisor = ({ dispatch, self }, { msg, err }) => {
			console.log("CrashableActor.supervisor", err);

			if (err.message === "Requested undefined user") {
				dispatch(self, {
					type: "ADD_USER",
					userId: msg.userId,
					userName: "STUB_USER",
				});

				return "requeue";
			}
		};

		it("should pass the actor the same message again, after any others in the mailbox", (done) =>
			createActorSystem({ enhancers: [queryEnhancer] })(
				async function* testActor({ spawn, dispatch, query }) {
					const actor = spawn(CrashableActor);

					dispatch(actor, {
						type: "ADD_USER",
						userId: 1,
						userName: "Alice",
					});
					dispatch(actor, { type: "GET_USER", userId: 2 });
					dispatch(actor, { type: "GET_USER", userId: 1 });

					const msg1 = yield;
					expect(msg1).toMatchObject({
						src: actor,
						type: "DESCRIBE_USER",
						userId: 1,
						user: {
							name: "Alice",
						},
					});

					const msg2 = yield;
					expect(msg2).toMatchObject({
						src: actor,
						type: "DESCRIBE_USER",
						userId: 2,
						user: {
							name: "STUB_USER",
						},
					});

					done();
				},
			));
	});

	describe("continue", () => {
		it.todo("should pass the actor the next message in the mailbox");
	});

	describe("restart", () => {
		it.todo("should start the actor again, with a clear mailbox");
	});

	describe("stop", () => {
		it.todo(
			"should stop the actor, which will then process no further messages",
		);
		it.todo("should stop all child actors");
	});

	describe("escalate", () => {
		it.todo(
			"should cause the parent actor to fail, calling its supervisor",
		);
	});

	describe("complex", () => {
		it.todo(
			"should retry 3 times, with a 500ms pause between, then continue",
		);
		it.todo("should retry 1 time, after a 500ms pause, then restart");
	});
});
