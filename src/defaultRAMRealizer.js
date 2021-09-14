export default function createDefaultRAMRealizer() {
	const bundles = {};

	async function kill({ self, parent }) {
		const { nickname } = bundles[self];
		delete bundles[self];
		delete bundles[parent].children[nickname];
		return true;
	}

	async function get(addr) {
		const bundle = bundles[addr] || null;

		return bundle;
	}

	async function set(bundle) {
		const bundleWithProperlyUndefinedState = Object.assign({}, bundle, {
			state: bundle.state === null ? undefined : bundle.state,
		});

		bundles[bundle.self] = Object.assign(
			{},
			bundles[bundle.self],
			bundleWithProperlyUndefinedState,
		);
		return true;
	}

	return { kill, get, set };
}
