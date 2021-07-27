let db;
const openDbListeners = [];
const openDbRequest = indexedDB.open("ingratesStore", 1);

openDbRequest.onsuccess = () => {
	db = openDbRequest.result;
	openDbListeners.forEach((done) => getDb().then(done));
};
openDbRequest.onupgradeneeded = ({ target: { result: db } }) => {
	const objectStore = db.createObjectStore("actorBundles", { keyPath: "self" });
	objectStore.createIndex("name", "name");
	objectStore.createIndex("nickname", "nickname");
	objectStore.createIndex("parent", "parent");
	objectStore.createIndex("self", "self");
};

export default async function getDb() {
	if (db) {
		return db;
	} else {
		return new Promise((done) => openDbListeners.push(done));
	}
}

