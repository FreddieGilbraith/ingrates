export default function createIndexDbRealizer(db) {
	async function* makePersistenceSerializer() {
		let response;
		while (true) {
			const [action, meta] = yield response;

			try {
				switch (action) {
					case "get": {
						const result = await new Promise((done, fail) => {
							const transaction = db.transaction(["actorBundles"], "readwrite");
							transaction.onerror = fail;

							const request = transaction.objectStore("actorBundles").get(meta);

							request.onsuccess = () => {
								done(request.result);
							};
							request.onerror = fail;
						});
						response = result;
						break;
					}

					case "set": {
						await new Promise((done, fail) => {
							const transaction = db.transaction(["actorBundles"], "readwrite");
							transaction.onerror = fail;

							const request = transaction.objectStore("actorBundles").put(meta);

							request.onsuccess = done;
							request.onerror = fail;
						});
						response = true;
						break;
					}

					default: {
						console.log(action, meta);
						break;
					}
				}
			} catch (e) {
				console.error(action, meta, e);
				void 0;
			}
		}
	}

	const serializer = makePersistenceSerializer();
	serializer.next();

	async function get(addr) {
		return serializer.next(["get", addr]).then((x) => x.value);
	}
	async function set(bundle) {
		return serializer.next(["set", bundle]).then((x) => x.value);
	}
	async function kill(addr) {
		return serializer.next(["kill", addr]).then((x) => x.value);
	}

	return {
		get,
		set,
		kill,
	};
}

