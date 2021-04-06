import "babel-polyfill";

import createActorSystem from "../src";

it("will reset and process remaining messages after a crash", (done) => {
	function* LogarithmActor({ dispatch }) {
		while (true) {
			const { num, src } = yield;
			const result = Math.log(num);
			if (Number.isNaN(result)) {
				throw new Error("num was negative");
			}

			dispatch(src, { result });
		}
	}

	createActorSystem()(function* TestActor({ spawn, dispatch, self }) {
		const logActor = spawn(LogarithmActor);
		dispatch(logActor, { num: 1 });
		dispatch(logActor, { num: 2 });
		dispatch(logActor, { num: -2 });
		dispatch(logActor, { num: 3 });
		dispatch(logActor, { num: 4 });

		done();
	});
});
