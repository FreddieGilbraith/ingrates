import { createTestSystem } from "./utils.js";

function SelfRequestKillActor({ msg, dispatch }) {
	if (msg.type === "PING") {
		dispatch(msg.src, { type: "PONG" });
	}
}

SelfRequestKillActor.startup = ({ dispatch, parent }) => {
	dispatch(parent, { type: "PLEASE_KILL_ME" });
};

const test = createTestSystem({ actors: [SelfRequestKillActor] });

test(function ShutdownChildTest({ kill, children, self, dispatch, msg, spawn }, { t, done, fail }) {
	switch (msg.type) {
		case "START_TEST": {
			spawn.selfKillChild(SelfRequestKillActor);
			setTimeout(dispatch, 10, self, {
				type: "CHECK_CHILDREN_COUNT",
				expect: ["selfKillChild"],
			});
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
			spawn.selfKillChild(SelfRequestKillActor);
			break;
		}

		case "PLEASE_KILL_ME": {
			kill(msg.src);
			dispatch(msg.src, { type: "PING" });
			dispatch(msg.src, { type: "PING" });
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

		default: {
			fail();
			break;
		}
	}
});
