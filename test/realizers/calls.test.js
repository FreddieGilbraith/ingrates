import test from "ava";
import { createActorSystem } from "../../src/index.js";

test.beforeEach((t) => {
	t.context.calls = [];

	function pushCall(r, f, x) {
		t.context.calls.push({ r, f, x });
	}

	const bundles = {
		PARENT: {
			children: { child: "CHILD" },
			name: "RootActor",
			parent: null,
			nickname: "root",
			self: "PARENT",
			args: [],
			state: null,
		},

		CHILD: {
			children: {},
			name: "ChildActor",
			parent: "PARENT",
			nickname: "child",
			self: "CHILD",
			args: [],
			state: { value: 123 },
		},
	};

	function createNonSavingStorage() {
		return {
			kill: async () => {},
			get: (addr) => {
				pushCall("first", "get", addr);
				if (addr === "PARENT") {
					return Promise.resolve(bundles.PARENT);
				}
				return Promise.resolve(null);
			},
			set: (bundle) => {
				pushCall("first", "set", bundle);
				return Promise.resolve(true);
			},
		};
	}

	function createPreExistingStorage() {
		return {
			kill: async () => {},
			get: (addr) => {
				pushCall("second", "get", addr);

				return bundles[addr];
			},
			set: (bundle) => {
				pushCall("second", "set", bundle);

				bundles[bundle.self] = Object.assign({}, bundles[bundle.self], bundle);
				return Promise.resolve(true);
			},
		};
	}

	t.context.system = createActorSystem({
		realizers: [createNonSavingStorage, createPreExistingStorage],
	});
});

test.skip("it will try to get the realizer state from realizers in order", async (t) => {
	await new Promise((done) => {
		function ChildActor() {}

		function RootActor({ dispatch, msg, children, self }) {
			switch (msg.type) {
				case "startTest": {
					dispatch(children.child, { type: "addValue", value: 5 });
					setTimeout(dispatch, 10, self, { type: "stopTest" });
					break;
				}

				case "stopTest": {
					done();
					break;
				}

				default:
					break;
			}
		}

		t.context.system.register(ChildActor);
		t.context.system.register(RootActor);

		t.context.system.dispatch("PARENT", { type: "startTest" });
	});

	// the first realizer contains the bundle we need. it didn't search further
	t.like(t.context.calls[0], { r: "first", f: "get", x: "PARENT" });

	// bundles are always broadcast to all realizers, it's up to them to decide to persist them or not
	t.like(t.context.calls[1], { r: "first", f: "set", x: { self: "PARENT" } });
	t.like(t.context.calls[2], { r: "second", f: "set", x: { self: "PARENT" } });

	// the first realizer doesn't contain the bundle, so we search in the second one too
	t.like(t.context.calls[3], { r: "first", f: "get", x: "CHILD" });
	t.like(t.context.calls[4], { r: "second", f: "get", x: "CHILD" });
});
