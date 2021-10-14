import { createTestSystem } from "./utils.js";

function SelfRequestKillActor({ msg, dispatch, parent }) {
	switch (msg.type) {
		case "Start": {
			setTimeout(dispatch, 0, parent, { type: "PLEASE_KILL_ME" });
			break;
		}

		case "PING": {
			dispatch(msg.src, { type: "PONG" });
			break;
		}
		default:
			break;
	}
}

const test = createTestSystem({ actors: [SelfRequestKillActor] });

test(function ShutdownChildTest({ kill, children, self, dispatch, msg, spawn }, { t, done }) {
	switch (msg.type) {
		case "Mount": {
			spawn.selfKillChild(SelfRequestKillActor);
			break;
		}

		case "CHECK_CHILDREN_COUNT": {
			t.deepEqual(Object.keys(children), msg.expect);

			break;
		}

		case "PLEASE_KILL_ME": {
			kill(msg.src);

			dispatch(self, { type: "CHECK_CHILDREN_COUNT", expect: [] });

			dispatch(self, { type: "DONE" });
			break;
		}

		case "DONE": {
			done();
			break;
		}

		default:
			break;
	}
});

test(function SendMsgsToDeadActor({ kill, self, dispatch, msg, spawn }, { t, done, fail }) {
	switch (msg.type) {
		case "Mount": {
			spawn.selfKillChild(SelfRequestKillActor);
			break;
		}

		case "PLEASE_KILL_ME": {
			dispatch(msg.src, { type: "PING" });
			kill(msg.src);
			dispatch(msg.src, { type: "PING" });

			setTimeout(dispatch, 10, self, { type: "DONE" });

			break;
		}

		case "PONG": {
			t.fail("child should not reply, as it was killed");
			break;
		}

		case "DONE": {
			done();
			break;
		}

		default:
			break;
	}
});

test.todo("an actor should not be able to shutdown an actor that is not their own direct child");
test.todo(
	"onErr should be called if an actor tries to kill an actor that is not their own direct child",
);
