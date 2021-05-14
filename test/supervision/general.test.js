import test from "ava";

import { createActorSystem } from "../../src/index.js";

test("will call supervision as expected on crash", (t) =>
	new Promise((done, fail) => {
		t.plan(2);

		let addr;

		function StopOnCrashActor({ msg }) {
			switch (msg.type) {
				case "PLEASE_CRASH": {
					throw new Error("planned test crash");
				}
			}
		}

		StopOnCrashActor.startup = () => ({
			initialState: true,
		});

		StopOnCrashActor.supervision = (e, meta, { stop }) => {
			t.is(e.message, "planned test crash");
			t.like(meta, {
				self: addr,
				state: {
					initialState: true,
				},
				msg: { type: "PLEASE_CRASH" },
			});
			done();
			return stop;
		};

		function RootActor() {}
		RootActor.startup = ({ spawn, dispatch }) => {
			addr = spawn.crashActor(StopOnCrashActor);
			dispatch(addr, { type: "PLEASE_CRASH" });
		};

		const system = createActorSystem({ onErr: () => {} });

		system.register(StopOnCrashActor);
		system.register(RootActor);
		system.spawn.root(RootActor);
	}));
