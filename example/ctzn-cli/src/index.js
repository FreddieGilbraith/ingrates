import { createActorSystem, defaultRAMRealizer } from "../../../dist/index.modern.js";
import queryEnhancer from "@little-bonsai/ingrates-query-enhancer";

import simpleFileSaveRealizer from "./realizers/simpleFileSave.js";
import ctznTransport from "./transports/ctzn.js";
import logEnhancer from "./enhancers/log.js";

import RootActor from "./actors/Root.js";

const actorSystem = createActorSystem({
	transports: [ctznTransport],
	enhancers: [logEnhancer("main"), queryEnhancer],
	realizers: [simpleFileSaveRealizer, defaultRAMRealizer],
});

actorSystem.register(RootActor);
actorSystem.spawn.root(RootActor);

export default actorSystem;
