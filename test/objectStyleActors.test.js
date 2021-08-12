import { createTestSystem } from "./utils.js";

const ChildActor = {
	name: "ChildActor",

	Mount: (_, startingValue) => ({ value: startingValue }),

	PleaseAdd: ({ msg, state }) => ({
		...state,
		value: state.value + msg.value,
	}),

	PleaseGet: ({ dispatch, msg, state }) => {
		dispatch(msg.src, { type: "Result", value: state.value });
	},
};

const test = createTestSystem({ actors: [ChildActor] });

test(function ObjectStyleActors(ps, { t, done, fail }) {
	const { self, spawn, dispatch, children, msg } = ps;
	switch (msg.type) {
		case "Mount": {
			spawn.myChild(ChildActor, 4);
			dispatch(self, { type: "Add", value: 1 });
			dispatch(self, { type: "Add", value: 2 });
			dispatch(self, { type: "Add", value: 3 });
			dispatch(self, { type: "Get" });
			break;
		}

		case "Add": {
			dispatch(children.myChild, { type: "PleaseAdd", value: msg.value });
			break;
		}

		case "Get": {
			dispatch(children.myChild, { type: "PleaseGet", value: msg.value });
			break;
		}

		case "Result": {
			t.is(msg.value, 10);
			done();
			break;
		}

		default:
			break;
	}
});
