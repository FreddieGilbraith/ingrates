import createActorSystem from "../../../dist/index.modern.js";
import queryEnhancer from "@little-bonsai/ingrates-query-enhancer";

import simpleFileSaveRealizer from "./simpleFileSaveRealizer.js";
import ctznTransport from "./ctznTransport.js";
import logEnhancer from "./logEnhancer.js";

import RootActor from "./actors/Root.js";

(async function main() {
	const actorSystem = await createActorSystem({
		transports: [ctznTransport],
		enhancers: [logEnhancer("main"), queryEnhancer],
		realizers: [simpleFileSaveRealizer],
	});

	actorSystem(RootActor);
})();
