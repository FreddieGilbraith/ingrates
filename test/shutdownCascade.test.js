import { createTestSystem } from "./utils.js";

function GrandChildActor({ dispatch, msg }) {
	if (msg.type === "PING") {
		dispatch(msg.src, { type: "PONG" });
	}
}

function ChildActor({ msg, spawn, dispatch, parent }) {
	if (msg.type === "Start") {
		const myChild = spawn.myChild(GrandChildActor);
		dispatch(parent, { type: "INTRO", myChild });
	}
}

const test = createTestSystem({ actors: [ChildActor, GrandChildActor] });

test.only(function WillKillChildrenOfShutdownActor(
	{ self, spawn, msg, dispatch, kill, children },
	{ t, done, fail },
) {
	switch (msg.type) {
		case "Start": {
			return;
		}

		case "Mount": {
			spawn.myChild(ChildActor);
			break;
		}

		case "INTRO": {
			const myGrandChild = msg.myChild;
			kill(children.myChild);
			setTimeout(dispatch, 10, myGrandChild, { type: "PING" });
			setTimeout(dispatch, 30, self, { type: "DONE" });
			break;
		}

		case "PONG": {
			t.fail("the grand child should not have been able to reply");
			fail();
			break;
		}

		case "DONE": {
			done();
			break;
		}

		default:
			fail(msg);
	}
});

test.todo("kill returns a promise that resolves once all children have been shutdown");
