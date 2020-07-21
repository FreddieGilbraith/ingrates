import { createSystem, defineActor } from "../src";

describe("snoop", () => {
	const childActor = defineActor("root", (msg, { dispatch, parent }) => {});
	const rootActor = defineActor("root", {
		START: (msg, { dispatch, parent, self, spawn }) => {
			const child = spawn("onlyChild", childActor);

			dispatch(parent, {
				type: "SPAWNED",
				rootId: self,
				childId: child,
			});
		},

		FORWARD: (msg, { children, dispatch }) => {
			dispatch(children.get("onlyChild"), msg);
		},
	});

	it("will report all messages it sees to the snooping function", async () => {
		const snoop = jest.fn();

		const system = createSystem({ root: rootActor, snoop });

		system.dispatch({ type: "START" });

		const { rootId, childId } = await system.next();

		system.dispatch({ type: "FORWARD", payload: "test-payload" });

		await new Promise((done) => setImmediate(done));

		expect(snoop).toHaveBeenCalledTimes(6);

		expect(snoop).toHaveBeenCalledWith({
			src: "__INTERNAL__",
			msg: { type: "INIT" },
			snk: rootId,
		});
		expect(snoop).toHaveBeenCalledWith({
			src: "__INTERNAL__",
			msg: { type: "INIT" },
			snk: childId,
		});

		expect(snoop).toHaveBeenCalledWith({
			src: "__EXTERNAL__",
			msg: { type: "START" },
			snk: rootId,
		});
		expect(snoop).toHaveBeenCalledWith({
			src: rootId,
			msg: { type: "SPAWNED", rootId, childId },
			snk: "__EXTERNAL__",
		});

		expect(snoop).toHaveBeenCalledWith({
			src: "__EXTERNAL__",
			msg: { type: "FORWARD", payload: "test-payload" },
			snk: rootId,
		});
		expect(snoop).toHaveBeenCalledWith({
			src: rootId,
			msg: { type: "FORWARD", payload: "test-payload" },
			snk: childId,
		});
	});
});
