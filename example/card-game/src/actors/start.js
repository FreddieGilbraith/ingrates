import "babel-core/register";
import "babel-polyfill";

import createDynamicSystemTransportSet from "../actorSystemTools/createDynamicSystemTransport";

import createEngineActorSystem from "./Engine/system";
import createConfigActorSystem from "./Config/system";

import EngineRoot from "./Engine/Root";
import ConfigRoot from "./Config/Root";

const createDynamicSystemTransport = createDynamicSystemTransportSet();

const engineActorSystem = createEngineActorSystem(createDynamicSystemTransport);
const configActorSystem = createConfigActorSystem(createDynamicSystemTransport);

const configAddr = configActorSystem.spawn.root(ConfigRoot);
const engineAddr = engineActorSystem.spawn.root(
	EngineRoot,
	`Config:${configAddr}`,
	createDynamicSystemTransport,
);
