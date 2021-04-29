import createActorSystem from "@little-bonsai/ingrates";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import mkdirp from "mkdirp";

import logEnhancer from "./logEnhancer.js";
import RootActor from "./actors/Root.js";
import SessionActor from "./actors/Session.js";

const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

async function* getAllPersistedBundles(folderPath) {
	const fileNames = await readdir(folderPath);
	const spawnBundles = {};

	for (const fileName of fileNames) {
		const persistedStr = await readFile(path.join(folderPath, fileName), "utf8");
		const persistedJSON = JSON.parse(persistedStr);
		yield persistedJSON;
	}
}

async function getStructuredSpawnBundles(bundleItter) {
	const spawnBundles = {};

	for await (const bundle of bundleItter) {
		const { parent, self, state, gen, args } = bundle;

		spawnBundles[parent] = [...(spawnBundles[parent] || []), { self, state, gen, args }];
	}

	return spawnBundles;
}

async function spawnActorsOnStartup({ folderPath, actors, spawnActor }) {
	const spawnBundles = await getStructuredSpawnBundles(getAllPersistedBundles(folderPath));

	(function doRecusiveSpawn(parent) {
		const bundle = spawnBundles[parent];

		if (!bundle) {
			return;
		}

		for (const { state, self, gen, args } of bundle) {
			spawnActor({ parent, state, self }, actors[gen], ...args);
			doRecusiveSpawn(self);
		}
	})(null);
}

function tryReadFile(filePath) {
	return new Promise((done) => fs.readFile(filePath, "utf8", (e, d) => done(d || null)));
}

function makeSimpleFileSaveRealizer({ folderPath, actors, debug }) {
	async function* SpecificPersister({ log }, trueActorAddress) {
		const filePath = path.join(folderPath, `${trueActorAddress}.json`);

		while (true) {
			try {
				const msg = yield;
				const bundleStr = await tryReadFile(filePath);
				const bundleObj = JSON.parse(bundleStr || "{}");
				const newBundle = {
					...bundleObj,
					...msg.properties,
				};
				await writeFile(filePath, JSON.stringify(newBundle, null, 2), "utf8");
			} catch (e) {
				if (debug) {
					log("error while persisting actor state", msg, e);
				}
			}
		}
	}

	function* PersistToFSActor({ dispatch, spawn, log }) {
		const persisters = {};

		while (true) {
			const msg = yield;

			if (msg.type === "spawn" && !msg.properties.gen) {
				continue;
			}

			if (msg.type === "spawn" && !actors[msg.properties.gen]) {
				if (debug) {
					log("No generator found to persist actor", msg.properties.gen);
				}
				continue;
			}

			if (msg.type === "spawn" || msg.type === "publish") {
				persisters[msg.properties.self] ||= spawn(SpecificPersister, msg.properties.self);
				dispatch(persisters[msg.properties.self], msg);
			}
		}
	}

	return async function simpleFileSaveRealizer({ spawnActor, dispatchEnvelope }) {
		await mkdirp(folderPath);

		await spawnActorsOnStartup({
			spawnActor,
			folderPath,
			actors,
		});

		let pushIntoSystem = null;
		createActorSystem({ enhancers: [logEnhancer("simpleFileSaveRealizer")] })(function* ({
			dispatch,
			spawn,
		}) {
			const fsPersister = spawn(PersistToFSActor);
			pushIntoSystem = dispatch.bind(null, fsPersister);
		});

		return async function updateListener(type, { gen, ...properties }) {
			try {
				if (gen) {
					pushIntoSystem({
						type,
						properties: {
							...properties,
							gen: gen.name,
						},
					});
				} else {
					pushIntoSystem({
						type,
						properties,
					});
				}
			} catch (e) {
				console.error("makeSimpleFileSaveRealizer.error", e);
			}
		};
	};
}

export default makeSimpleFileSaveRealizer({
	folderPath: path.join(process.cwd(), "ingratesState"),
	actors: { RootActor, SessionActor },
});
