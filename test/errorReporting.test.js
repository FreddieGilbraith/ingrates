import "babel-polyfill";
import createActorSystem from "../src";

function flushPromises() {
	return new Promise((x) => setImmediate(x));
}

describe("error reporting", () => {
	beforeEach(() => {
		jest.spyOn(console, "error").mockImplementation(() => {});
	});
	afterEach(() => {
		jest.resetAllMocks();
	});

	async function* errorCreatingActor() {
		const msg = yield;
		if (msg.type === "FAIL") {
			throw new Error("test error");
		}
	}

	it("should console.error if an actor fails", (done) => {
		createActorSystem()(async function* testActor({ spawn, dispatch }) {
			const problemChild = spawn(errorCreatingActor);

			dispatch(problemChild, { type: "FAIL" });

			await flushPromises();

			expect(console.error).toHaveBeenCalledWith(
				problemChild,
				new Error("test error"),
			);

			done();
		});
	});

	it("can override the error handler", (done) => {
		const onErr = jest.fn();
		createActorSystem({ onErr })(async function* testActor({
			spawn,
			dispatch,
		}) {
			const problemChild = spawn(errorCreatingActor);

			dispatch(problemChild, { type: "FAIL" });

			await flushPromises();

			expect(console.error).not.toHaveBeenCalled();
			expect(onErr).toHaveBeenCalledWith(
				problemChild,
				new Error("test error"),
			);

			done();
		});
	});
});
