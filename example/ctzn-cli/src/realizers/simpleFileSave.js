import fs from "fs";
import mkdirp from "mkdirp";
import path from "path";
import { promisify } from "util";

import logEnhancer from "../enhancers/log.js";

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);

const readJSON = (path) => readFile(path, "utf8").then(JSON.parse);
const writeJSON = (path, obj) => writeFile(path, JSON.stringify(obj, null, 2), "utf8");

export default function createFileSaveRealizer(basePath) {
	return function ingratesRealizerFileSave({ runActor, doKill, createActorSystem }) {
		async function ActorPersisterActor({ msg, log, name }, meta) {
			const fileDir = path.resolve(basePath, meta.name);
			const filePath = path.resolve(fileDir, `${meta.self}.json`);

			switch (msg.type) {
				case "MOUNT": {
					await mkdir(fileDir, { recursive: true });
					const x = await writeJSON(filePath, meta);

					break;
				}

				case "DISPATCH": {
					const bundle = await readJSON(filePath);
					const state = await runActor({
						...bundle,
						...msg.meta,
					});

					await writeJSON(filePath, { ...bundle, state });

					break;
				}

				default:
					log(msg);
			}
		}

		function RootActor({ msg, log, spawn, dispatch, children }) {
			switch (msg.type) {
				case "SPAWN": {
					const addr = spawn[msg.meta.self](ActorPersisterActor, msg.meta);
					dispatch(addr, { type: "MOUNT", meta: msg.meta });
					if (msg.meta.parent) {
						dispatch(children[addr], { type: "BIRTH", meta: msg.meta });
					}
					break;
				}

				case "DISPATCH": {
					dispatch(children[msg.meta.self], msg);
					break;
				}
			}
		}

		const system = createActorSystem({ enhancers: [logEnhancer("fileRealizer")] });
		system.register(RootActor);
		system.register(ActorPersisterActor);
		const rootAddr = system.spawn.root(RootActor);

		function injestEvent(type, meta) {
			system.dispatch(rootAddr, { type, meta });
			return true;
		}

		return {
			dispatch: injestEvent.bind(null, "DISPATCH"),
			kill: injestEvent.bind(null, "KILL"),
			spawn: injestEvent.bind(null, "SPAWN"),
		};
	};
}
