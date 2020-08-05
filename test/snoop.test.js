import "babel-polyfill";
import createActorSystem from "../src";

function flushPromises() {
	return new Promise((x) => setImmediate(x));
}

async function* childActor({ dispatch, parent }, name, age) {
	while (true) {
		const msg = yield;
		switch (msg.type) {
			case "BOUNCE":
				dispatch(msg.src, msg);
				break;
			case "STOP":
				return;
		}
	}
}

it("informs the snoop function of what's going on inside the system", (done) => {
	const snoop = jest.fn();

	createActorSystem({ snoop })(async function* rootActor({
		spawn,
		dispatch,
		self,
	}) {
		const child = spawn(childActor, "first born", 123);

		dispatch(child, { type: "INFO", meta: true });
		dispatch(child, { type: "BOUNCE", ping: "pong" });
		dispatch(child, { type: "STOP" });

		await flushPromises();

		expect(snoop).toHaveBeenCalledTimes(7);

		// spawn root
		expect(snoop.mock.calls[0]).toEqual([
			"spawn",
			{ self, parent: null, gen: rootActor, args: [] },
		]);

		// spawn child
		expect(snoop.mock.calls[1]).toEqual([
			"spawn",
			{
				self: child,
				parent: self,
				gen: childActor,
				args: ["first born", 123],
			},
		]);

		//dispatch three actions to child
		expect(snoop.mock.calls[2]).toEqual([
			"dispatch",
			{
				src: self,
				snk: child,
				msg: { type: "INFO", meta: true },
			},
		]);

		expect(snoop.mock.calls[3]).toEqual([
			"dispatch",
			{
				src: self,
				snk: child,
				msg: { type: "BOUNCE", ping: "pong" },
			},
		]);

		expect(snoop.mock.calls[4]).toEqual([
			"dispatch",
			{
				src: self,
				snk: child,
				msg: { type: "STOP" },
			},
		]);

		// response message is sent
		expect(snoop.mock.calls[5]).toEqual([
			"dispatch",
			{
				src: child,
				snk: self,
				msg: { type: "BOUNCE", ping: "pong", src: self },
			},
		]);

		// the child has terminated
		expect(snoop.mock.calls[6]).toEqual(["stop", { id: child }]);

		done();
	});
});
