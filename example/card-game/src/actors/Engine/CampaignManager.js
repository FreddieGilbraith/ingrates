import * as R from "ramda";
import fixedId from "fixed-id";

import { register } from "./system";

register(CampaignManager);

async function createKnownCampaignsDb() {
	const openDbRequest = indexedDB.open("knownCampaigns", 1);

	const db = await new Promise((done) => {
		openDbRequest.onsuccess = () => {
			done(openDbRequest.result);
		};

		openDbRequest.onupgradeneeded = ({ target: { result: db } }) => {
			db.createObjectStore("knownCampaigns", { keyPath: "id" });
		};
	});

	return db;
}

async function createSpecificCampaignDb(id) {
	const openDbRequest = indexedDB.open(`Campaign:${id}`, 1);

	const db = await new Promise((done) => {
		openDbRequest.onsuccess = () => {
			done(openDbRequest.result);
		};

		openDbRequest.onupgradeneeded = ({ target: { result: db } }) => {
			const objectStore = db.createObjectStore("actorBundles", { keyPath: "self" });
			objectStore.createIndex("name", "name");
			objectStore.createIndex("nickname", "nickname");
			objectStore.createIndex("parent", "parent");
			objectStore.createIndex("self", "self");
		};
	});

	return db;
}

export default async function CampaignManager({ self, msg, log, state, dispatch }) {
	switch (msg.type) {
		case "Start": {
			const db = await createKnownCampaignsDb();
			return R.assoc("db", db);
		}

		case "RenderCampaignsList": {
			const knownCampaigns = await new Promise((done, fail) => {
				const transaction = state.db.transaction(["knownCampaigns"], "readwrite");
				transaction.onerror = fail;

				const request = transaction.objectStore("knownCampaigns").getAll();

				request.onsuccess = () => {
					done(request.result);
				};
				request.onerror = fail;
			});

			dispatch("render", {
				path: ["engine", "campaigns"],
				value: knownCampaigns.map(R.prop("id")),
			});

			break;
		}

		case "CreateNewCampaign": {
			const newCampaignId = fixedId();
			await createSpecificCampaignDb(newCampaignId);
			await new Promise((done, fail) => {
				const transaction = state.db.transaction(["knownCampaigns"], "readwrite");
				transaction.onerror = fail;

				const request = transaction
					.objectStore("knownCampaigns")
					.put({ id: newCampaignId });

				request.onsuccess = done;
				request.onerror = fail;
			});

			dispatch(self, { type: "RenderCampaignsList" });
			break;
		}

		default: {
			log(msg);
			break;
		}
	}
}
