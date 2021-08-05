import { createActorSystem, createDefaultRAMRealizer } from "@little-bonsai/ingrates";

import acquireEnhancer from "@little-bonsai/ingrates-acquire-enhancer";
import assertEnhancer from "@little-bonsai/ingrates-assert-enhancer";
import createLogEnhancer from "@little-bonsai/ingrates-log-enhancer";
import { createQueryEnhancer, QueryActor } from "@little-bonsai/ingrates-query-enhancer";

import createIndexDbRealizer from "./createIndexDbRealizer";
import getDb from "./getIndexDb";

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
	transports: [
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
	realizers: [createDefaultRAMRealizer, createIndexDbRealizer.bind(null, getDb)],
});

actorSystem.register(QueryActor);

export default actorSystem;
