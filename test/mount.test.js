import test from "ava";
import { createActorSystem } from "../src/index.js";

import { sleep } from "./utils.js";

const fakePersistedAddress = "aBcD123";

test("can mount an actor", (t) =>
	new Promise((done) => {
		t.plan(3);

		function fakePersistedRealizer() {
			function get(addr) {
				t.is(addr, fakePersistedAddress);

				return {
					children: {},
					name: "RootActor",
					parent: null,
					nickname: "root",
					self: fakePersistedAddress,
					args: [],
					state: undefined,
				};
			}

			function set(bundle) {
				t.deepEqual(bundle, {
					children: {},
					name: "RootActor",
					parent: null,
					nickname: "root",
					self: fakePersistedAddress,
					args: [],
					state: undefined,
				});
			}

			function kill() {}

			return { kill, get, set };
		}

		const system = createActorSystem({
			realizers: [fakePersistedRealizer],
		});

		function RootActor({ msg, spawn }) {
			t.is(msg.type, "Mount");
		}

		system.register(RootActor);

		system.mount(fakePersistedAddress);

		sleep(10).then(done);
	}));
