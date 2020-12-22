import "babel-polyfill";
import createActorSystem from "../src";

function pause() {
	return new Promise((x) => setTimeout(x, Math.random() * 10));
}

async function* doublerActor({ parent, dispatch }) {
	while (true) {
		const msg = yield;
		if (msg.type === "SHOULD_REPLY") {
			await pause();
			dispatch(msg.src, { ...msg, value: msg.value * 2 });
		}
	}
}

it("can directly query an actor", (done) => {
	createActorSystem()(async function* testActor({
		spawn,
		dispatch,
		self,
		query,
	}) {
		const child = spawn(doublerActor);
		const reply = await query(child, {
			type: "SHOULD_REPLY",
			test: true,
			value: 2,
		});

		expect(reply).toEqual({
			type: "SHOULD_REPLY",
			src: expect.any(String),
			test: true,
			value: 4,
		});

		done();
	});
});

it("reject if the timeout is reached", (done) => {
	createActorSystem()(async function* testActor({
		spawn,
		dispatch,
		self,
		query,
	}) {
		const child = spawn(doublerActor);

		try {
			const reply = await query(child, { type: "NO_REPLY" });
		} catch (e) {
			done();
		}
	});
});