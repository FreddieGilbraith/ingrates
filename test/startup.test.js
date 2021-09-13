import test from "ava";
import { createActorSystem } from "../src/index.js";

test("will create an error when spawning unknown actor", (t) =>
	new Promise((done) => {
		t.plan(4);

		const onErr = (errorKind, actorName, errorMsg) => {
			t.is(errorKind, "StartError");
			t.is(actorName, "UnregisteredActor");
			t.is(errorMsg, "unregistered actor");

			done();
		};

		const system = createActorSystem({
			onErr,
		});

		function UnregisteredActor() {}

		function RootActor({ msg, spawn }) {
			if (msg.type === "Start") {
				spawn(UnregisteredActor);
			}
			t.pass("does not throw");
		}

		system.register(RootActor);

		system.spawn(RootActor);
	}));
