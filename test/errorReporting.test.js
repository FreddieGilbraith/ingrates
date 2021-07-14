import test from "ava";

import { createActorSystem } from "../src/index.js";

function SyncCrashingActor({ msg, state = { msgs: 0 } }) {
	if (msg.type === "PLEASE_CRASH") {
		throw new Error("Sync Actor Crashed Running");
	} else {
		return {
			msgs: state.msgs + 1,
		};
	}
}

test.only("reports a crash from a sync actor while running ", (t) =>
	new Promise((done) => {
		t.plan(3);

		let addr;
		function onErr(errType, error, meta) {
			t.is(errType, "RunError");
			t.is(error.message, "Sync Actor Crashed Running");
			t.like(meta, {
				name: "SyncCrashingActor",
				parent: null,
				self: addr,
				msg: { src: null, type: "PLEASE_CRASH" },
				state: { msgs: 5 },
			});
			done();
		}

		const system = createActorSystem({ onErr });
		system.register(SyncCrashingActor);
		addr = system.spawn.testSyncCrashing(SyncCrashingActor);
		system.dispatch(addr, { type: "INC" });
		system.dispatch(addr, { type: "INC" });
		system.dispatch(addr, { type: "INC" });
		system.dispatch(addr, { type: "PLEASE_CRASH" });
	}));

//////////////////////////////

async function AsyncCrashingActor({ msg, state = { msgs: 0 } }) {
	if (msg.type === "PLEASE_CRASH") {
		throw new Error("Async Actor Crashed Running");
	} else {
		return {
			msgs: state.msgs + 1,
		};
	}
}

test("reports a crash from an async actor while running ", (t) =>
	new Promise((done) => {
		t.plan(3);

		let addr;
		function onErr(errType, error, meta) {
			t.is(errType, "RunError");
			t.is(error.message, "Async Actor Crashed Running");
			t.like(meta, {
				name: "AsyncCrashingActor",
				parent: null,
				self: addr,
				msg: { src: null, type: "PLEASE_CRASH" },
				state: { msgs: 4 },
			});
			done();
		}

		const system = createActorSystem({ onErr });
		system.register(AsyncCrashingActor);
		addr = system.spawn.testAsyncCrashing(AsyncCrashingActor);
		system.dispatch(addr, { type: "INC" });
		system.dispatch(addr, { type: "INC" });
		system.dispatch(addr, { type: "INC" });
		system.dispatch(addr, { type: "PLEASE_CRASH" });
	}));

