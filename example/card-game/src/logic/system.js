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

		return function handle(snk, msg) {
			if (snk === "render") {
				postMessage({
					snk,
					...msg,
				});
			}
		};
	};
}

const actorSystem = createActorSystem({
	enhancers: [
		createLogEnhancer("logic", {
			log: (...args) =>
				postMessage({
					snk: "console",
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
