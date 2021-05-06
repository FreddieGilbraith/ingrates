import { createTestSystem } from "./utils.js";

const testEnhancerOne = ({ dispatch, self }) => ({ goCrazy: dispatch.bind(null, self) });
const testEnhancerTwo = ({ goCrazy }) => ({
	overlook: () => goCrazy({ type: "SHINE", work: Infinity, play: 0 }),
});

const test = createTestSystem({ enhancers: [testEnhancerOne, testEnhancerTwo] });

test.only(function JackTestance({ dispatch, self, goCrazy, overlook, msg }, { t, done, fail }) {
	switch (msg.type) {
		case "START_TEST": {
			t.plan(2);
			goCrazy({ type: "SANE" });
			overlook();
			dispatch(self, { type: "FINISH" });
			break;
		}

		case "SANE": {
			t.pass();
			break;
		}

		case "SHINE": {
			t.like(msg, { work: Infinity, play: 0 });
			break;
		}

		case "FINISH": {
			done();
			break;
		}
		default: {
			fail();
			break;
		}
	}
});
