import "babel-polyfill";
import createActorSystem from "../src";

function pause() {
	return new Promise((x) => setTimeout(x, Math.random() * 10));
}

async function* doublerActor({ parent, dispatch }) {
	const msg = yield;
	await pause();
	dispatch(parent, { ...msg, value: msg.value * 2 });
}

it("can directly query an actor", (done) => {
	createActorSystem()(async function* testActor({
		spawn,
		dispatch,
		self,
		query,
	}) {
		const child = spawn(childActor);
		dispatch(child, { test: true });
		const reply = yield;

		expect(reply).toEqual({
			test: true,
			src: self,
		});

		done();
	});
});

it.todo("reject if the timeout is reached");
