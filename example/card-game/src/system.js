import { createActorSystem, createDefaultRAMRealizer } from "../../../dist/index.modern.js";

import logEnhancer from "./enhancers/log.js";
import aquireEnhancer from "./enhancers/aquire.js";

const actorSystem = createActorSystem({
	enhancers: [logEnhancer("main"), aquireEnhancer],
	realizers: [createDefaultRAMRealizer()],
});

export default actorSystem;
