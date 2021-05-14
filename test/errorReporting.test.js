import test from "ava";

import { createActorSystem } from "../src/index.js";

function SyncCrashingActor({ msg, state }) {
	if (msg.type === "PLEASE_CRASH") {
		throw new Error("Sync Actor Crashed Running");
	} else {
		return {
			msgs: state.msgs + 1,
		};
	}
}
SyncCrashingActor.startup = (_, crashOnStartup) => {
	if (crashOnStartup) {
		throw new Error("Sync Actor Crashed Starting");
	}

	return { msgs: 0 };
};

test("reports a crash from a sync actor while starting ", (t) =>
	new Promise((done) => {
		t.plan(3);

		function onErr(errType, error, meta) {
			t.is(errType, "StartError");
			t.is(error.message, "Sync Actor Crashed Starting");
			t.like(meta, { name: "SyncCrashingActor" });
			done();
		}

		const system = createActorSystem({ onErr });
		system.register(SyncCrashingActor);
		system.spawn.testSyncCrashing(SyncCrashingActor, true);
	}));

test("reports a crash from a sync actor while running ", (t) =>
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
				state: { msgs: 3 },
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

async function AsyncCrashingActor({ msg, state }) {
	if (msg.type === "PLEASE_CRASH") {
		throw new Error("Async Actor Crashed Running");
	} else {
		return {
			msgs: state.msgs + 1,
		};
	}
}
AsyncCrashingActor.startup = async (_, crashOnStartup) => {
	if (crashOnStartup) {
		throw new Error("Async Actor Crashed Starting");
	}

	return { msgs: 0 };
};

test("reports a crash from an async actor while starting ", (t) =>
	new Promise((done) => {
		t.plan(3);

		function onErr(errType, error, meta) {
			t.is(errType, "StartError");
			t.is(error.message, "Async Actor Crashed Starting");
			t.like(meta, { name: "AsyncCrashingActor" });
			done();
		}

		const system = createActorSystem({ onErr });
		system.register(AsyncCrashingActor);
		system.spawn.testAsyncCrashing(AsyncCrashingActor, true);
	}));

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
				state: { msgs: 3 },
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

//////////////////////////////

function RejectingCrashingActor({ msg, state }) {
	if (msg.type === "PLEASE_CRASH") {
		return Promise.reject(new Error("Rejecting Actor Crashed Running"));
	} else {
		return {
			msgs: state.msgs + 1,
		};
	}
}
RejectingCrashingActor.startup = (_, crashOnStartup) => {
	if (crashOnStartup) {
		return Promise.reject(new Error("Rejecting Actor Crashed Starting"));
	}

	return { msgs: 0 };
};

test("reports a crash from a rejecting actor while starting ", (t) =>
	new Promise((done) => {
		t.plan(3);

		function onErr(errType, error, meta) {
			t.is(errType, "StartError");
			t.is(error.message, "Rejecting Actor Crashed Starting");
			t.like(meta, { name: "RejectingCrashingActor" });
			done();
		}

		const system = createActorSystem({ onErr });
		system.register(RejectingCrashingActor);
		system.spawn.testRejectingCrashing(RejectingCrashingActor, true);
	}));

test("reports a crash from a rejecting actor while running ", (t) =>
	new Promise((done) => {
		t.plan(3);

		let addr;
		function onErr(errType, error, meta) {
			t.is(errType, "RunError");
			t.is(error.message, "Rejecting Actor Crashed Running");
			t.like(meta, {
				name: "RejectingCrashingActor",
				parent: null,
				self: addr,
				msg: { src: null, type: "PLEASE_CRASH" },
				state: { msgs: 3 },
			});
			done();
		}

		const system = createActorSystem({ onErr });
		system.register(RejectingCrashingActor);
		addr = system.spawn.testRejectingCrashing(RejectingCrashingActor);
		system.dispatch(addr, { type: "INC" });
		system.dispatch(addr, { type: "INC" });
		system.dispatch(addr, { type: "INC" });
		system.dispatch(addr, { type: "PLEASE_CRASH" });
	}));

//////////////////////////////
