import fs from "fs";
import path from "path";
import { promisify } from "util";

import RootActor from "./actors/Root.js";
import SessionActor from "./actors/Session.js";

const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

function makeSimpleFileSaveRealizer({ folderPath, actors }) {
	return async function simpleFileSaveRealizer({ spawnActor, dispatchEnvelope }) {
		const fileNames = await readdir(folderPath);
		const spawnBundles = {};

		for (const fileName of fileNames) {
			const persisted = await readFile(path.join(folderPath, fileName), "utf8").then(
				JSON.parse,
			);
			const { parent, self, state, gen, args } = persisted;

			spawnBundles[parent] = [...(spawnBundles[parent] || []), { self, state, gen, args }];
		}

		(function doRecusiveSpawn(parent) {
			const bundle = spawnBundles[parent];
			if (!bundle) {
				return;
			}

			for (const { state, self, gen, args } of bundle) {
				spawnActor({ parent, state, self }, actors[gen], ...args);
			}
		})(null);

		return async function updateListener(type, { parent, args, gen, state, self, id, value }) {
			switch (type) {
				case "spawn": {
					await writeFile(
						path.join(folderPath, `${self}.json`),
						JSON.stringify({
							self,
							parent,
							args,
							gen: gen.name,
							state,
						}),
					);
					break;
				}

				case "publish": {
					const currentBundle = await readFile(
						path.join(folderPath, `${id}.json`),
						"utf8",
					).then(JSON.parse);
					currentBundle.state = value;

					await writeFile(
						path.join(folderPath, `${id}.json`),
						JSON.stringify(currentBundle.state),
					);
					break;
				}
			}
		};
	};
}

export default makeSimpleFileSaveRealizer({
	folderPath: "./ingratesState",
	actors: { RootActor, SessionActor },
});
