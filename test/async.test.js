import { mountRoot, defineActor } from "../src";

describe("async", () => {
	it("runs each message one at a time", async () => {
		let currentlyRunning = 0;
		const upDownActor = defineActor(
			"Up Down",
			async (msg, { dispatch, sender }) => {
				switch (msg.type) {
					case "RUN":
						currentlyRunning++;
						await new Promise((done) => setTimeout(done), 10);
						currentlyRunning--;
						dispatch(sender, { type: "DONE" });
				}
			},
		);

		const system = mountRoot(upDownActor);

		expect(currentlyRunning).toBe(0);

		system.dispatch({ type: "RUN" });
		system.dispatch({ type: "RUN" });
		system.dispatch({ type: "RUN" });

		for await (const msg of system.stream()) {
			expect(currentlyRunning).toBe(1);
		}

		expect(currentlyRunning).toBe(0);
	});
});
