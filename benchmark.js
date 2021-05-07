import { performance } from "perf_hooks";

import createActorSystem from "./dist/index.modern.js";

function getStandardDeviation(xs) {
	const n = xs.length;
	const mean = xs.reduce((a, b) => a + b) / n;
	return Math.sqrt(xs.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

async function runTestActor(depth) {
	function RecursiveChild({ self, kill, parent, spawn, dispatch, state, msg }, depth) {
		switch (msg.type) {
			case "INTRO": {
				dispatch(msg.addr, { type: "HELLO" });
				dispatch(msg.addr, { type: "HELLO" });
				dispatch(msg.addr, { type: "HELLO" });
				break;
			}

			case "HELLO": {
				dispatch(msg.src, { type: "GOODBYE" });
				break;
			}

			case "GOODBYE": {
				const helloCount = state.helloCount + 1;
				if (helloCount >= 3) {
					dispatch(self, { type: "DONE" });
				}

				return {
					...state,
					helloCount,
				};
			}

			case "DONE": {
				const doneCount = state.doneCount + 1;

				kill(msg.src);

				if (doneCount >= 2) {
					dispatch(parent, { type: "DONE" });
				}

				return {
					...state,
					doneCount,
				};
			}

			default: {
				break;
			}
		}

		return state;
	}

	RecursiveChild.startup = ({ parent, spawn, dispatch }, depth) => {
		if (depth > 0) {
			const left = spawn.left(RecursiveChild, depth - 1);
			const right = spawn.right(RecursiveChild, depth - 1);

			dispatch(left, { type: "INTRO", addr: right });
			dispatch(right, { type: "INTRO", addr: left });
		}

		return {
			doneCount: 0,
			helloCount: 0,
		};
	};

	const system = createActorSystem();
	system.register(RecursiveChild);

	await new Promise((done, fail) => {
		system.register(TestActor);

		function TestActor({ spawn, dispatch, msg }) {
			console.log("TestActor", msg);
			switch (msg.type) {
				case "DONE": {
					done();
				}
				default: {
					fail();
					break;
				}
			}
		}

		TestActor.startup = ({ spawn, self, dispatch }) => {
			spawn.recursiveChild(RecursiveChild, depth);
		};

		system.spawn.testActor(TestActor);
	});
}

(async function main(runs, depth) {
	const actors = Math.pow(2, depth);
	const durations = [];

	console.log(`creating a binary tree of actors with depth ${depth} (${actors} actors)`);
	for (let i = 0; i < runs; i++) {
		const start = performance.now();
		await runTestActor(depth);
		durations.push(performance.now() - start);
	}

	durations.sort();

	const totalSamples = durations.length;
	const toDiscard = Math.floor(totalSamples * 0.05);

	const nonOutlierDurations = durations
		.slice(0, totalSamples - toDiscard)
		.slice(toDiscard, Infinity);

	const avg = nonOutlierDurations.reduce((a, b) => a + b) / nonOutlierDurations.length;
	const stdDev = getStandardDeviation(nonOutlierDurations);

	printResults({
		samples: nonOutlierDurations.length,
		avg,
		stdDev,
		actors,
	});
})(64, 3).catch(console.error);

function printResults({ samples, avg, stdDev, actors }) {
	console.log(`
samples: ${samples}
avg: ${avg.toPrecision(4)}ms (${(avg / actors).toPrecision(4)} ms/actor)
stdDev: ${stdDev.toPrecision(4)}ms (${(stdDev / actors).toPrecision(4)} ms/actor)
`);
}
