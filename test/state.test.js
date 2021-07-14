import { createTestSystem } from "./utils.js";

function StatefulTestActor({ msg, dispatch, state }) {
	switch (msg.type) {
		case "Start": {
			return 1;
		}

		case "foo": {
			return (x) => x + 1;
		}
		case "bar": {
			void 0;
			break;
		}

		case "query": {
			dispatch(msg.src, { type: "response", state });
			break;
		}

		default: {
			break;
		}
	}
}

const test = createTestSystem({
	actors: [StatefulTestActor],
});

test(function RetainsStateIfActorReturnsUndefined({ msg, spawn, dispatch }, { t, done }) {
	switch (msg.type) {
		case "Mount": {
			const addr = spawn(StatefulTestActor);

			dispatch(addr, { type: "foo" });
			dispatch(addr, { type: "foo" });
			dispatch(addr, { type: "foo" });
			dispatch(addr, { type: "bar" });
			dispatch(addr, { type: "foo" });
			dispatch(addr, { type: "query" });
			break;
		}

		case "response": {
			t.is(msg.state, 5);
			done();
			break;
		}

		default: {
			break;
		}
	}
});
