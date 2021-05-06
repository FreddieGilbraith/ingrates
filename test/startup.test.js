import { createTestSystem, pause } from "./utils.js";

function ChildActor({ dispatch, msg }) {
	if (msg.type === "PING") {
		dispatch(msg.src, { type: "PONG" });
	}
}

const test = createTestSystem({ actors: [ChildActor] });

function ActorWithSyncStartupFunctionality({ self, dispatch, state, msg }, { t, done, fail }) {
	switch (msg.type) {
		case "START_TEST": {
			t.like(state, { newState: true });
			setTimeout(dispatch, 10, self, { type: "DONE" });
			break;
		}

		case "PONG": {
			t.like(msg, { type: "PONG" });
			break;
		}

		case "DONE": {
			done();
			break;
		}

		default: {
			fail();
			break;
		}
	}
}

ActorWithSyncStartupFunctionality.startup = ({ spawn, dispatch }, { t }) => {
	t.plan(2);

	const child = spawn.testChild(ChildActor);

	dispatch(child, { type: "PING" });

	return {
		newState: true,
	};
};

test(ActorWithSyncStartupFunctionality);

function ActorWithAsyncStartupFunctionality({ self, dispatch, state, msg }, { t, done, fail }) {
	switch (msg.type) {
		case "START_TEST": {
			t.like(state, { newState: true });
			setTimeout(dispatch, 10, self, { type: "DONE" });
			break;
		}

		case "PONG": {
			t.like(msg, { type: "PONG" });
			break;
		}

		case "DONE": {
			done();
			break;
		}

		default: {
			fail();
			break;
		}
	}
}

ActorWithAsyncStartupFunctionality.startup = async ({ spawn, dispatch }, { t }) => {
	t.plan(2);

	await pause();

	const child = spawn.testChild(ChildActor);

	await pause();

	dispatch(child, { type: "PING" });

	await pause();

	return {
		newState: true,
	};
};

test(ActorWithAsyncStartupFunctionality);
