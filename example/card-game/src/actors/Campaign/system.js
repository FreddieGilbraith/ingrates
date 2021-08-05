import { makeAddress, createActorSystem, createDefaultRAMRealizer } from "@little-bonsai/ingrates";

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
	const namespace = `Campaign(${id})`;

	const campaignActorSystem = createActorSystem({
		addressFn: () => `${namespace}:${makeAddress()}`,
		enhancers: [
			createLogEnhancer("campgn", {
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
			createDynamicSystemTransport({
				accept: (snk) => snk.startsWith(namespace),
				transformIncoming: (snk, msg) => [snk, msg],
				transformOutgoing: (snk, msg) => [snk, msg],
			}),
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
