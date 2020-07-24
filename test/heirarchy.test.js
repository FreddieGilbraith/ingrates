import defineSystem from "../src";

describe("heirarchy", () => {
	function createActors() {
		const mockConsole = jest.fn();

		function rootActor(
			state,
			msg,
			{ name, parent, dispatch, spawn, children },
		) {
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
		}

		function loggerActor(state, msg, { sender }) {
			mockConsole(`message from ${msg.senderName} : ${msg.payload}`);
		}

		function calculatorActor(
			state,
			msg,
			{ dispatch, friends, parent, name },
		) {
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
		}

		return { rootActor, mockConsole };
	}

	it("will log correct outputs", async () => {
		const { rootActor, mockConsole } = createActors();

		const system = defineSystem().mount(rootActor);

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
