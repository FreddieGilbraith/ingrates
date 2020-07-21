import { createSystem, defineActor } from "../src";

describe("heirarchy", () => {
	function createActors() {
		const mockConsole = jest.fn();

		const rootActor = defineActor(
			"root",
			(msg, { name, parent, dispatch, spawn, children }) => {
				const logger =
					children.get("logger") ?? spawn("logger", loggerActor);
				const calculator =
					children.get("calculator") ??
					spawn("calculator", calculatorActor);

				switch (msg.type) {
					case "INIT":
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
							senderName: name,
						});

						dispatch(parent, { type: "DONE" });
						break;
				}
			},
		);

		const loggerActor = defineActor("logger", (msg, { sender }) => {
			mockConsole(`message from ${msg.senderName} : ${msg.payload}`);
		});

		const calculatorActor = defineActor(
			"calculator",
			(msg, { dispatch, friends, parent, name }) => {
				switch (msg.type) {
					case "INTRO":
						const { logger } = msg;
						friends.set("logger", logger);
						break;

					case "ADD":
						const { lhs, rhs } = msg;
						const result = lhs + rhs;
						dispatch(friends.get("logger"), {
							type: "LOG",
							payload: `lhs: "${lhs}"`,
							senderName: name,
						});
						dispatch(friends.get("logger"), {
							type: "LOG",
							payload: `rhs: "${rhs}"`,
							senderName: name,
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

		const system = createSystem({ root: rootActor });

		await new Promise((done) => setTimeout(done, 100));

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
