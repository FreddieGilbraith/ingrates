import "babel-polyfill";

import createActorSystem from "../src";

describe("supervision", () => {
	beforeEach(() => {
		jest.spyOn(console, "error").mockImplementation(() => {});
	});
	afterEach(() => {
		jest.resetAllMocks();
	});

	describe("general", () => {
		it.todo("should recieve the message that caused the failure");
		it.todo("should recieve the state at the time of failure");
	});

	describe("retry", () => {
		it.todo(
			"should pass the actor the same message again, before any others in the mailbox",
		);
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
