import test from "ava";

import { createActorSystem } from "../../src/index.js";

import { sleep } from "../utils.js";

test.skip("will call the parent actors supervision function", async (t) => {
	t.plan(2);

	const Child = {
		ThrowRecoverableError: () => {
			throw new Error("Recoverable");
		},
		ThrowTerminalError: () => {
			throw new Error("Terminal");
		},

		supervision: (error, meta, response) => {
			return response.escalate;
		},
	};

	function Parent({ msg, spawn, dispatch }) {
		if (msg.type === "Start") {
			const childAddr = spawn.child(Child);
			dispatch(childAddr, { type: "ThrowRecoverableError" });
			dispatch(childAddr, { type: "ThrowTerminalError" });
		}
	}

	Parent.supervision = (error, meta, response) => {
		t.truthy(error);
	};

	const system = createActorSystem({ onErr: () => {} });

	system.register(Child);
	system.register(Parent);

	system.spawn(Parent);

	await sleep(1);
});

test.todo("will increment an 'escalationLevel' property on the thrown error");
test.todo("will kill respond to the system with whatever the the parent supervisor returns");
