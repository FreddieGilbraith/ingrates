import defineSystem from "../src";

describe("basic api", () => {
	function rootActor(state = {}, msg, { dispatch, parent }, ...args) {
		if (msg.type === "TEST_MSG") {
			dispatch(parent, { type: "TEST_RESPONSE" });
		}
	}

	it("can create a system", () => {
		const system = defineSystem().mount(rootActor);
	});

	it("can dispatch a messge into the system", (done) => {
		const system = defineSystem().mount(rootActor);
		system.dispatch({
			type: "TEST_MSG",
		});

		setTimeout(done, 100);
	});

	it("can subscribe to messages coming out of the system", (done) => {
		const system = defineSystem().mount(rootActor);

		system.subscribe((msg) => {
			expect(msg).toEqual({ type: "TEST_RESPONSE" });

			done();
		});

		system.dispatch({
			type: "TEST_MSG",
		});
	});
});
