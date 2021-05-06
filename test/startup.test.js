import { createTestSystem } from "./utils.js";

function ChildActor({ dispatch, msg }) {
	if (msg.type === "PING") {
		dispatch(msg.src, { type: "PONG" });
	}
}

function ActorWithStartupFunctionality({ self, dispatch, state, msg }, { t, done, fail }) {
	switch (msg.type) {
		case "START_TEST": {
			t.plan(2);
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

ActorWithStartupFunctionality.startup = ({ spawn, dispatch }) => {
	const child = spawn.testChild(ChildActor);

	dispatch(child, { type: "PING" });

	return {
		newState: true,
	};
};

const test = createTestSystem({ actors: [ChildActor] });

test(ActorWithStartupFunctionality);
