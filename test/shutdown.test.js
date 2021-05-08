import { createTestSystem } from "./utils.js";

function SelfRequestKillActor({ msg, dispatch }) {
	switch (msg.type) {
		case "ECHO": {
			dispatch(msg.src, { type: "ECHO" });
			break;
		}

		case "PING": {
			dispatch(msg.src, { type: "PONG" });
			break;
		}
	}
}

SelfRequestKillActor.startup = ({ dispatch, parent }) => {
	setTimeout(dispatch, 0, parent, { type: "PLEASE_KILL_ME" });
};

const test = createTestSystem({ actors: [SelfRequestKillActor] });

test(function ShutdownChildTest({ kill, children, self, dispatch, msg, spawn }, { t, done, fail }) {
	switch (msg.type) {
		case "START_TEST": {
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

		default: {
			fail();
			break;
		}
	}
});

test(function SendMsgsToDeadActor({ kill, self, dispatch, msg, spawn }, { t, done, fail }) {
	switch (msg.type) {
		case "START_TEST": {
			t.plan(3);
			spawn.selfKillChild(SelfRequestKillActor);
			break;
		}

		case "PLEASE_KILL_ME": {
			dispatch(msg.src, { type: "ECHO" });
			dispatch(msg.src, { type: "ECHO" });
			dispatch(msg.src, { type: "ECHO" });
			kill(msg.src);
			dispatch(msg.src, { type: "PING" });
			dispatch(msg.src, { type: "PING" });
			dispatch(msg.src, { type: "PING" });

			setTimeout(dispatch, 10, self, { type: "DONE" });

			break;
		}

		case "ECHO": {
			t.pass("should should reply, as it's not been killed yet");
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

		default: {
			fail();
			break;
		}
	}
});
