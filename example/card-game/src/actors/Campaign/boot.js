import Root from "./Root";

export default async function bootCampaignActorSystem(db, system) {
	try {
		const rootAddr = await new Promise((done, fail) => {
			const transaction = db.transaction(["actorBundles"], "readwrite");
			transaction.onerror = fail;

			const request = transaction.objectStore("actorBundles").index("name").get("Root");

			request.onsuccess = () => {
				done(request.result);
			};
			request.onerror = fail;
		});

		system.dispatch(rootAddr.self, { type: "Begin" });
	} catch (e) {
		system.spawn.root(Root);
	}
}
