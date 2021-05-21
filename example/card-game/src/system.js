import { createActorSystem, createDefaultRAMRealizer } from "../../../dist/index.modern.js";

import logEnhancer from "./enhancers/log.js";
import aquireEnhancer from "./enhancers/aquire.js";
import createLocalStorageRealizer from "./realizers/localStorage";

const actorSystem = createActorSystem({
	enhancers: [logEnhancer("main"), aquireEnhancer],
	realizers: [
		createLocalStorageRealizer(["RootActor", "SessionActor"]),
		createDefaultRAMRealizer(),
	],
});

export default actorSystem;
