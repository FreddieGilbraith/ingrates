import "babel-core/register";
import "babel-polyfill";

import getDb from "./getIndexDb";
import system from ".";
import Root from "../actors/Root";

async function getRootAddr(db) {
	return new Promise((done, fail) => {
		const transaction = db.transaction(["actorBundles"], "readwrite");
		transaction.onerror = fail;

		const request = transaction.objectStore("actorBundles").index("name").get("Root");

		request.onsuccess = () => done(request.result && request.result.self);
	});
}

async function main() {
	const db = await getDb();
	const rootAddr = (await getRootAddr(db)) || system.spawn.root(Root);

	system.dispatch(rootAddr, { type: "Noop" });
}

main();
