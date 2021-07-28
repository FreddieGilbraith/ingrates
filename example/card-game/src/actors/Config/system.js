import { createActorSystem, createDefaultRAMRealizer } from "../../../../../src/index.js";
import acquireEnhancer from "@little-bonsai/ingrates-acquire-enhancer";
import assertEnhancer from "@little-bonsai/ingrates-assert-enhancer";
import createLogEnhancer from "@little-bonsai/ingrates-log-enhancer";
import { createQueryEnhancer, QueryActor } from "@little-bonsai/ingrates-query-enhancer";

import createSignpostTransport from "../../actorSystemTools/createSignpostTransport";

const actorDefinitions = [];

export const register = (x) => actorDefinitions.push(x);

register(QueryActor);

export default function createConfigActorSystem(createDynamicSystemTransport) {
	const configActorSystem = createActorSystem({
		enhancers: [
			createLogEnhancer("config", {
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
			createDynamicSystemTransport("Config"),
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

	actorDefinitions.map(configActorSystem.register);

	return configActorSystem;
}
