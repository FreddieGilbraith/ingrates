import { createSystem, defineActor } from "../src";

describe("strict mode", () => {
	it("will report nothing if the dispatch was called with a serialisable object", async () => {
		const strict = jest.fn();

		const goodActor = defineActor("good", (msg, { dispatch, parent }) => {
			dispatch(parent, { type: "BOUNCE", msg });
		});

		const system = createSystem({
			root: goodActor,
			strict,
		});

		system.dispatch({ type: "INPUT" });

		await system.next();

		expect(strict).not.toHaveBeenCalled();
	});

	for (const { msg: testMsg, err, path, problem } of [
		{
			problem: "a property is undefined",
			path: "msg.undef",
			err: "property is undefined",
			msg: { undef: undefined },
		},
		{
			problem: "a property is a function",
			path: "msg.func",
			err: "property is a Function",
			msg: { func: () => {} },
		},
		{
			problem: "a property is a Symbol",
			path: "msg.sym",
			err: "property is a Symbol",
			msg: { sym: Symbol("foo") },
		},
		{
			problem: "a property is a Date",
			path: "msg.date",
			err: "property is a Date",
			msg: { date: new Date(0) },
		},
		{
			problem: "there's a deep invalid property",
			path: "msg.foo.bar[2].baz",
			err: "property is a Function",
			msg: {
				foo: {
					bar: [true, false, { baz: () => {} }],
				},
			},
		},
	]) {
		it(`reports error "${err}" @ "${path}" when ${problem}`, async () => {
			const strict = jest.fn();

			const goodActor = defineActor("good", {});
			const badActor = defineActor("bad", {
				FOR_BAD: (msg, { dispatch, parent }) => {
					dispatch(parent, { type: "TEST_MSG", ...testMsg });
				},
			});

			const rootActor = defineActor("root", {
				INIT: (msg, { dispatch, parent, self, spawn }) => {
					const goodAddr = spawn("good", goodActor);
					const badAddr = spawn("bad", badActor);
				},

				INTROSPECT: (msg, { dispatch, children, parent, self }) => {
					dispatch(parent, {
						type: "ADDRS",
						rootAddr: self,
						goodAddr: children.get("good"),
						badAddr: children.get("bad"),
					});
				},

				FOR_GOOD: (msg, { forward, children }) => {
					forward(children.get("good"));
				},

				FOR_BAD: (msg, { forward, children }) => {
					forward(children.get("bad"));
				},
			});

			const system = createSystem({
				root: rootActor,
				strict,
			});

			system.dispatch({
				type: "INTROSPECT",
			});

			const { rootAddr, goodAddr, badAddr } = await system.next();

			system.dispatch({
				type: "FOR_GOOD",
				...testMsg,
			});

			system.dispatch({
				type: "FOR_BAD",
			});

			await new Promise((x) => setImmediate(x));

			expect(strict).toHaveBeenCalledWith({
				src: "__EXTERNAL__",
				msg: { type: "FOR_GOOD", ...testMsg },
				snk: rootAddr,
				error: { err, path },
			});
			expect(strict).toHaveBeenCalledWith({
				src: "__EXTERNAL__",
				msg: { type: "FOR_GOOD", ...testMsg },
				snk: goodAddr,
				error: { err, path },
			});
			expect(strict).toHaveBeenCalledWith({
				src: badAddr,
				msg: { type: "TEST_MSG", ...testMsg },
				snk: rootAddr,
				error: { err, path },
			});
			expect(strict).toHaveBeenCalledTimes(3);
		});
	}
});
