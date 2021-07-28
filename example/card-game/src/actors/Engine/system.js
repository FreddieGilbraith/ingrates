import { createActorSystem } from "../../../../../src/index.js";
import acquireEnhancer from "@little-bonsai/ingrates-acquire-enhancer";
import assertEnhancer from "@little-bonsai/ingrates-assert-enhancer";
import createLogEnhancer from "@little-bonsai/ingrates-log-enhancer";
import { createQueryEnhancer, QueryActor } from "@little-bonsai/ingrates-query-enhancer";

import createSignpostTransport from "../../actorSystemTools/createSignpostTransport";

const actorDefinitions = [];

export const register = (x) => actorDefinitions.push(x);

register(QueryActor);

export default function createEngineActorSystem(createDynamicSystemTransport) {
	const engineActorSystem = createActorSystem({
		enhancers: [
			createLogEnhancer("engine", {
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

		transports: [
			createDynamicSystemTransport("Engine"),
			createSignpostTransport(
				(() => {
					let signpostContainer = {};
					const read = () => signpostContainer;
					const write = (newContainer) => {
						signpostContainer = newContainer;
					};

					return { read, write };
				})(),
			),
		],
	});

	actorDefinitions.map(engineActorSystem.register);

	return engineActorSystem;
}
