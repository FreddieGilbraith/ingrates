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

	it("should console.error if a sync actor fails", (done) => {
		function* errorCreatingActor() {
			const msg = yield;
			if (msg.type === "FAIL") {
				throw new Error("test error");
			}
		}

		createActorSystem()(async function* testActor({ spawn, dispatch }) {
			const problemChild = spawn(errorCreatingActor);

			dispatch(problemChild, { type: "FAIL" });

			await flushPromises();

			expect(console.error).toHaveBeenCalledWith(
				"Ingrates Error",
				problemChild,
				expect.objectContaining({
					parent: expect.any(String),
				}),
				new Error("test error"),
			);

			done();
		});
	});
	it("should console.error if an async actor fails", (done) => {
		async function* errorCreatingActor() {
			const msg = yield;
			if (msg.type === "FAIL") {
				throw new Error("test error");
			}
		}

		createActorSystem()(async function* testActor({ spawn, dispatch }) {
			const problemChild = spawn(errorCreatingActor);

			dispatch(problemChild, { type: "FAIL" });

			await flushPromises();

			expect(console.error).toHaveBeenCalledWith(
				"Ingrates Error",
				problemChild,
				expect.objectContaining({
					parent: expect.any(String),
				}),
				new Error("test error"),
			);

			done();
		});
	});

	it("can override the error handler", (done) => {
		function* errorCreatingActor() {
			const msg = yield;
			if (msg.type === "FAIL") {
				throw new Error("test error");
			}
		}

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
				expect.objectContaining({
					parent: expect.any(String),
				}),
				new Error("test error"),
			);

			done();
		});
	});
});
