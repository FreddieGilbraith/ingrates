export default function createLocalStorageRealizer(actors) {
	const actorsSet = new Set(actors);

	async function get(self) {
		return JSON.parse(localStorage[`actor_${self}`] || "false");
	}

	async function set(bundle) {
		if (bundle.self === "CJuhviI7Q9y0ruSUyn3ugOr1") {
			console.log("set", bundle);
		}

		if (actorsSet.has(bundle.name)) {
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
