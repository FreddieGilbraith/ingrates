import { createActorSystem, createDefaultRAMRealizer } from "../../../dist/index.modern.js";

import logEnhancer from "./enhancers/log";
import aquireEnhancer from "./enhancers/aquire";
import assertEnhancer from "./enhancers/assert";

import createLocalStorageRealizer from "./realizers/localStorage";

const actorSystem = createActorSystem({
	enhancers: [logEnhancer("main"), aquireEnhancer, assertEnhancer],
	realizers: [
		createLocalStorageRealizer({ blockList: ["ReactHookActor"] }),
		createDefaultRAMRealizer(),
	],
});

export default actorSystem;
