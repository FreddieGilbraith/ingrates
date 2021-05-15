async function wait() {
	await new Promise((x) => setTimeout(x, 3));
}

export default function createDefaultRAMRealizer() {
	const bundles = {};

	async function kill({ self, parent }) {
		const { nickname } = bundles[self];
		delete bundles[self];
		delete bundles[parent].children[nickname];
		return true;
	}

	async function get(self) {
		await wait();
		return bundles[self] || null;
	}

	async function set(bundle) {
		await wait();
		bundles[bundle.self] = {
			...bundles[bundle.self],
			...bundle,
		};
		((bundles[bundle.parent] || {}).children || {})[bundle.nickname] = bundle.self;
		return true;
	}

	return { kill, get, set };
}
