import { createTestSystem } from "./utils.js";

function ChildActor() {}

const test = createTestSystem({ actors: [ChildActor] });

test(function CanAccessOwnChildren({ spawn, children, dispatch, self, msg }, { t, done }) {
	switch (msg.type) {
		case "Mount": {
			spawn.testChild(ChildActor);
			dispatch(self, { type: "CHECK_CHILDREN" });
			break;
		}

		case "CHECK_CHILDREN": {
			t.truthy(children.testChild);
			done();
		}
	}
});
