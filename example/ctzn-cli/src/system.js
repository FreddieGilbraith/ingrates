import fs from "fs";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";
import { createActorSystem, createDefaultRAMRealizer } from "../../../dist/index.modern.js";
import queryEnhancer from "@little-bonsai/ingrates-query-enhancer";

import simpleFileSaveRealizer from "./realizers/simpleFileSave.js";
import ctznTransport from "./transports/ctzn.js";
import logEnhancer from "./enhancers/log.js";
import aquireEnhancer from "./enhancers/aquire.js";

export const storageFolder = path.resolve(
	fileURLToPath(import.meta.url),
	"..",
	"..",
	"ingratesState",
);
const actorSystem = createActorSystem({
	transports: [ctznTransport],
	enhancers: [logEnhancer("main"), aquireEnhancer, queryEnhancer],
	realizers: [
		simpleFileSaveRealizer({
			basePath: storageFolder,
			actors: ["RootActor", "SessionActor"],
		}),
		createDefaultRAMRealizer(),
	],
});

export default actorSystem;
