import "babel-polyfill";

import createActorSystem from "../src";

function flushPromises() {
	return new Promise((done) => setImmediate(done));
}

describe("supervision", () => {
	beforeEach(() => {
		jest.spyOn(console, "error").mockImplementation(() => {});
	});
	afterEach(() => {
		jest.resetAllMocks();
	});

	describe("retry", () => {});
	describe("continue", () => {});
	describe("restart", () => {});
	describe("stop", () => {});

	describe("escalate", () => {});

	async function* errorThrowingActor({}) {
		while (true) {
			const msg = yield;

			switch (msg.type) {
				case "THROW":
					(() => {
						throw new Error("test throw");
					})();

				case "REJECT":
					await Promise.reject(new Error("test rejection"));
			}
		}
	}

	it.todo("stub");
});
