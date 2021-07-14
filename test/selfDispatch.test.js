import { createTestSystem } from "./utils.js";

const test = createTestSystem({ actors: [] });

test(function SimpleSelfDispatchingTest({ dispatch, self, msg }, { done, fail }) {
	switch (msg.type) {
		case "Mount": {
			dispatch(self, { type: "ALL_GOOD" });
			break;
		}

		case "ALL_GOOD": {
			done();
			break;
		}

		default:
			break;
	}
});
