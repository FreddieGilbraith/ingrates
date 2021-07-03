import { createActorSystem, createDefaultRAMRealizer } from "../../../../src/index.js";
import acquireEnhancer from "@little-bonsai/ingrates-acquire-enhancer";
import assertEnhancer from "@little-bonsai/ingrates-assert-enhancer";
import createLogEnhancer from "@little-bonsai/ingrates-log-enhancer";
import { createQueryEnhancer, QueryActor } from "@little-bonsai/ingrates-query-enhancer";

function createWorkerTransport() {
	return function workerTransport(dispatch) {
		onmessage = function onMessage(event) {
			const msg = event.data;

			if (msg.type === "_ingrates_") {
				dispatch("render", msg.snk, msg.msg);
			}
		};

		let outputQueue = [];
		let sendFnId;

		function flushQueue() {
			postMessage({
				id: "_render_",
				payload: outputQueue,
			});

			sendFnId = null;
			outputQueue = [];
		}

		return function handle(snk, msg) {
			if (snk === "render") {
				outputQueue.push({ snk, msg });
				if (!sendFnId) {
					sendFnId = setTimeout(flushQueue, 16);
				}
			}
		};
	};
}

const actorSystem = createActorSystem({
	enhancers: [
		createLogEnhancer("logic", {
			log: (...args) =>
				postMessage({
					id: "_console_",
					method: "log",
					args,
				}),
		}),
		acquireEnhancer,
		assertEnhancer,
		createQueryEnhancer(),
	],
	transports: [createWorkerTransport()],
	realizers: [createDefaultRAMRealizer()],
});

actorSystem.register(QueryActor);

export default actorSystem;
