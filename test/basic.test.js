import { createTestSystem } from "./utils.js";

function ChildActor({ dispatch, msg, state }, startingValue) {
	switch (msg.type) {
		case "Mount": {
			return {
				value: startingValue,
			};
		}

		case "PLEASE_ADD": {
			return {
				...state,
				value: state.value + msg.value,
			};
		}

		case "PLEASE_GET": {
			dispatch(msg.src, { type: "RESULT", value: state.value });
			return state;
		}

		default: {
			return state;
		}
	}
}

const test = createTestSystem({ actors: [ChildActor] });

test(function BasicFunctionalitySketch(ps, { t, done, fail }) {
	const { self, spawn, dispatch, children, msg } = ps;
	switch (msg.type) {
		case "Mount": {
			spawn.myChild(ChildActor, 4);
			dispatch(self, { type: "ADD", value: 1 });
			dispatch(self, { type: "ADD", value: 2 });
			dispatch(self, { type: "ADD", value: 3 });
			dispatch(self, { type: "GET" });
			break;
		}

		case "ADD": {
			dispatch(children.myChild, { type: "PLEASE_ADD", value: msg.value });
			break;
		}

		case "GET": {
			dispatch(children.myChild, { type: "PLEASE_GET", value: msg.value });
			break;
		}

		case "RESULT": {
			t.is(msg.value, 10);
			done();
			break;
		}

		default:
			break;
	}
});
