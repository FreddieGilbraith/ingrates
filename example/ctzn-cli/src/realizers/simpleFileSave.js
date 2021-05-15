import fs from "fs";
import mkdirp from "mkdirp";
import path from "path";
import { promisify } from "util";

import logEnhancer from "../enhancers/log.js";

const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const writeFile = promisify(fs.writeFile);

const readJSON = (path) => readFile(path, "utf8").then(JSON.parse);
const writeJSON = (path, obj) => writeFile(path, JSON.stringify(obj, null, 2), "utf8");

function saneRace(ps) {
	return new Promise((done) => {
		let failCount = 0;
		ps.forEach((p) =>
			p.then(done).catch(() => {
				failCount++;
				if (failCount === ps.length) {
					done(null);
				}
			}),
		);
	});
}

export default function createFileSaveRealizer({ basePath, actors }) {
	async function kill({ self, parent }) {
		console.log("kill", { self, parent });
		const deadBundle = await get(self);
	}

	async function get(self) {
		const persistedBundle = await saneRace(
			actors.map((name) => {
				const filePath = path.resolve(basePath, name, `${self}.json`);
				return readJSON(filePath);
			}),
		);

		return persistedBundle;
	}

	async function set(bundle) {
		if (!actors.includes(bundle.name)) {
			return false;
		}

		const fileDir = path.resolve(basePath, bundle.name);
		const filePath = path.resolve(fileDir, `${bundle.self}.json`);
		await mkdir(fileDir, { recursive: true });
		await writeJSON(filePath, bundle);

		if (bundle.parent) {
			const parentBundle = await saneRace(
				actors.map((name) => {
					const filePath = path.resolve(basePath, name, `${bundle.parent}.json`);
					return readJSON(filePath);
				}),
			);
			if (parentBundle) {
				await set({
					...parentBundle,
					children: { ...parentBundle.children, [bundle.nickname]: bundle.self },
				});
			}
		}

		return true;
	}

	return {
		kill,
		get,
		set,
	};
}
