import test from "ava";
import createActorSystem from "../src/index.js";

export function flushPromises() {
	return new Promise((done) => setImmediate(done));
}

export function pause() {
	return new Promise((x) => setTimeout(x, Math.random() * 10));
}

export function sleep(y) {
	return new Promise((x) => setTimeout(x, y));
}

export function queryEnhancer({ spawn }) {
	function query(snk, msg, timeout = 100) {
		return new Promise((done, fail) => {
			function* QueryActor({ self, dispatch }) {
				dispatch(snk, msg);
				setTimeout(dispatch.bind(null, self, { type: "TIMEOUT" }), timeout);

				const response = yield;

				if (response.type === "TIMEOUT") {
					fail({ type: "QUERY_TIMEOUT", timeout });
				} else {
					done(response);
				}
			}

			spawn(QueryActor);
		});
	}

	return {
		query,
	};
}

export function createTestSystem({ actors, ...rest }) {
	function runTest(testActor) {
		test(testActor.name, (t) => {
			const system = createActorSystem(rest);

			for (const actor of actors) {
				system.register(actor);
			}

			system.register(testActor);

			new Promise((done, fail) => {
				t.timeout(500);
				system.dispatch(system.spawn.testRoot(testActor, { t, done, fail }), {
					type: "START_TEST",
				});
			});
		});
	}

	runTest.only = (testActor) => {
		test.only(testActor.name, (t) => {
			const system = createActorSystem(rest);

			for (const actor of actors) {
				system.register(actor);
			}

			system.register(testActor);

			new Promise((done, fail) => {
				t.timeout(500);
				system.dispatch(system.spawn.testRoot(testActor, { t, done, fail }), {
					type: "START_TEST",
				});
			});
		});
	};

	return runTest;
}
