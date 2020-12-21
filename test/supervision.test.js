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

	describe("default supervision", () => {
		it("swallows the error when an actor throws", (done) => {
			const errorHandler = jest.fn();
			process.on("unhandledRejection", errorHandler);

			createActorSystem()(async function* testActor({ spawn, dispatch }) {
				const throwingActor = spawn(errorThrowingActor);

				dispatch(throwingActor, { type: "THROW" });

				await flushPromises();

				expect(errorHandler).not.toHaveBeenCalled();

				done();
			});
		});

		it("swallows the error when an actor rejects", (done) => {
			const errorHandler = jest.fn();
			process.on("unhandledRejection", errorHandler);

			createActorSystem()(async function* testActor({ spawn, dispatch }) {
				const throwingActor = spawn(errorThrowingActor);

				dispatch(throwingActor, { type: "REJECT" });

				await flushPromises();

				expect(errorHandler).not.toHaveBeenCalled();

				done();
			});
		});
	});
});
