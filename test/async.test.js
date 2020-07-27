import defineSystem from "../src";

jest.useFakeTimers();

describe("async", () => {
	it("runs each message one at a time", async () => {
		let currentlyRunning = 0;

		async function upDownActor(state, msg, { dispatch, sender }) {
			if (msg.type === "RUN") {
				currentlyRunning++;
				await new Promise((done) => setTimeout(done), 10);
				currentlyRunning--;
				dispatch(sender, { type: "DONE" });
			}
		}

		const system = defineSystem().mount(upDownActor);

		expect(currentlyRunning).toBe(0);

		system.dispatch({ type: "RUN" });
		await Promise.resolve();
		expect(currentlyRunning).toBe(1);

		jest.advanceTimersByTime(5);
		expect(currentlyRunning).toBe(1);

		system.dispatch({ type: "RUN" });
		system.dispatch({ type: "RUN" });
		await new Promise((done) => setImmediate(done));

		jest.advanceTimersByTime(10);
		await new Promise((done) => setImmediate(done));
		expect(currentlyRunning).toBe(1);

		jest.advanceTimersByTime(10);
		await new Promise((done) => setImmediate(done));
		expect(currentlyRunning).toBe(0);
	});
});
