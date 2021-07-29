import * as R from "ramda";
import { makeAddress } from "../../../../../src/index.js";

import { register } from "./system";
import createCampaignActorSystem from "../Campaign/system";
import bootCampaignActorSystem from "../Campaign/boot";

register(CampaignManager);

async function getKnownCampaignsDb() {
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

async function getSpecificCampaignDb(id) {
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

export default async function CampaignManager(
	{ self, msg, log, state, dispatch },
	createDynamicSystemTransport,
) {
	switch (msg.type) {
		case "RenderCampaignsList": {
			const knownCampaignsDb = await getKnownCampaignsDb();

			const knownCampaigns = await new Promise((done, fail) => {
				const transaction = knownCampaignsDb.transaction(["knownCampaigns"], "readwrite");
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
			const knownCampaignsDb = await getKnownCampaignsDb();

			const newCampaignId = makeAddress();
			await getSpecificCampaignDb(newCampaignId);

			await new Promise((done, fail) => {
				const transaction = knownCampaignsDb.transaction(["knownCampaigns"], "readwrite");
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

		case "MountCampaign": {
			const campaignDb = await getSpecificCampaignDb(msg.campaign);
			const campaignActorSystem = await createCampaignActorSystem(
				campaignDb,
				msg.campaign,
				createDynamicSystemTransport,
			);

			const campaignRootAddr = await bootCampaignActorSystem(campaignDb, campaignActorSystem);

			dispatch("render", { path: ["campaign"], value: { addr: campaignRootAddr } });

			return R.assocPath(["campaignRootAddrs", msg.campaign], campaignRootAddr);
		}

		default: {
			log(msg);
			break;
		}
	}
}
