import { mountRoot, defineActor } from "../src";

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
				mockConsole(`message from ${getName(sender)} : ${msg.payload}`);
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
