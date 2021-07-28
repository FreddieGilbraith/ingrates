import { createActorSystem, createDefaultRAMRealizer } from "../../../../../src/index.js";
import acquireEnhancer from "@little-bonsai/ingrates-acquire-enhancer";
import assertEnhancer from "@little-bonsai/ingrates-assert-enhancer";
import createLogEnhancer from "@little-bonsai/ingrates-log-enhancer";
import { createQueryEnhancer, QueryActor } from "@little-bonsai/ingrates-query-enhancer";

import createSignpostTransport from "../../actorSystemTools/createSignpostTransport";
import createIndexDbRealizer from "../../actorSystemTools/createIndexDbRealizer";

const actorDefinitions = [];

export const register = (x) => actorDefinitions.push(x);

register(QueryActor);

export default async function createCampaignActorSystem(db, id, createDynamicSystemTransport) {
	const campaignActorSystem = createActorSystem({
		enhancers: [
			createLogEnhancer("campaign", {
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
			createDynamicSystemTransport(`Campaign(${id})`),
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

		realizers: [createDefaultRAMRealizer, createIndexDbRealizer.bind(null, db)],
	});

	actorDefinitions.map(campaignActorSystem.register);

	return campaignActorSystem;
}
