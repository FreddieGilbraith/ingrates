import fs from "fs";
import { promisify } from "util";
import path from "path";

import system, { storageFolder } from "./system.js";

import RootActor from "./actors/Root.js";

const readdir = promisify(fs.readdir);

async function aquireRootAddr() {
	try {
		const [rootActorBundle] = await readdir(path.resolve(storageFolder, "RootActor"));

		return rootActorBundle.replace(".json", "");
	} catch (e) {
		console.log("starting the system for the first time");
		return system.spawn.root(RootActor);
	}
}

(async function main() {
	const rootAddr = await aquireRootAddr();
	system.dispatch(rootAddr, { type: "STARTUP" });
})();
