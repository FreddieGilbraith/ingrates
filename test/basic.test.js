import test from "ava";

import createActorSystem from "../src/index.js";

test("ava", (t) =>
	new Promise((done) => {
		t.timeout(100);

		function ChildActor({ parent, dispatch, msg, state }, startingValue) {}

		ChildActor.startup = ({ state }, startingValue) => {
			return {
				...state,
				value: startingValue,
			};
		};

		function RootActor({ spawn, dispatch, children, parent, msg }) {
			switch (msg.type) {
				case "ADD": {
					dispatch(children.myChild, { type: "PLEASE_ADD", value: msg.value });
					break;
				}
				case "GET": {
					dispatch(children.myChild, { type: "PLEASE_GET", value: msg.value });
					break;
				}
				case "RESULT": {
					dispatch(parent, { type: "RESULT", value: msg.value });
					break;
				}
			}
		}

		RootActor.startup = ({ spawn }) => {
			spawn.myChild(ChildActor, 4);
		};

		const system = createActorSystem();

		system.register(RootActor);
		system.register(ChildActor);

		const root = system.spawn.root(RootActor);

		system.dispatch(root, { type: "ADD", value: 1 });
		system.dispatch(root, { type: "ADD", value: 2 });
		system.dispatch(root, { type: "ADD", value: 3 });
		system.dispatch(root, { type: "GET" });

		system.listen((msg) => {
			t.is(msg, { type: "RESULT", value: 10 });
			done();
		});
	}));
