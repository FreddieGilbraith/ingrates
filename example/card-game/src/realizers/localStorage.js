export default function createLocalStorageRealizer({ blockList, passList }) {
	const blockSet = new Set(blockList);

	async function get(self) {
		return JSON.parse(localStorage[`actor_${self}`] || "false");
	}

	async function set(bundle) {
		// instead of having a comprehensive Block/Pass list, we should instead check to see if the
		// parent of an actor has been persisted, and use the list to circumvent that check

		console.log("set", bundle);
		if (!blockSet.has(bundle.name)) {
			localStorage[`actor_${bundle.self}`] = JSON.stringify(bundle);
		}
	}

	async function kill({ self, parent }) {
		console.log("kill", { self, parent });
	}

	return {
		get,
		set,
		kill,
	};
}
