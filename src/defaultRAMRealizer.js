export default function createDefaultRAMRealizer() {
	const bundles = {};

	async function kill({ self, parent }) {
		const { nickname } = bundles[self];
		delete bundles[self];
		delete bundles[parent].children[nickname];
		return true;
	}

	async function get(self) {
		const bundle = bundles[self] || null;

		return bundle;
	}

	async function set(bundle) {
		bundles[bundle.self] = {
			...bundles[bundle.self],
			...bundle,
		};
		return true;
	}

	return { kill, get, set };
}
