import Root from "./Root";

export default async function bootCampaignActorSystem(db, system) {
	try {
		const rootBundle = await new Promise((done, fail) => {
			const transaction = db.transaction(["actorBundles"], "readwrite");
			transaction.onerror = fail;

			const request = transaction.objectStore("actorBundles").index("name").get("Root");

			request.onsuccess = () => {
				done(request.result);
			};
			request.onerror = fail;
		});

		system.mount(rootBundle.self);

		return rootBundle.self;
	} catch (e) {
		return system.spawn.root(Root);
	}
}
