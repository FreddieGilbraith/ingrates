import { createTestSystem } from "./utils.js";

function GrandChildActor({ dispatch, msg }) {
	if (msg.type === "PING") {
		dispatch(msg.src, { type: "PONG" });
	}
}

function ChildActor() {}

ChildActor.startup = ({ spawn, parent, dispatch }) => {
	const myChild = spawn.myChild(GrandChildActor);
	dispatch(parent, { type: "INTRO", myChild });
};

const test = createTestSystem({ actors: [ChildActor, GrandChildActor] });

test(function WillKillChildrenOfShutdownActor(
	{ self, spawn, msg, dispatch, kill, children },
	{ t, done, fail },
) {
	switch (msg.type) {
		case "START_TEST": {
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
	}
});
