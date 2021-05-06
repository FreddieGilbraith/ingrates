export default function localRealizer({ runActor }) {
	const bundles = {};

	async function flush(self) {
		if (
			!bundles[self] ||
			bundles[self].running ||
			bundles[self].mailbox.length === 0 ||
			bundles[self].state === undefined
		) {
			return;
		}

		bundles[self].running = true;

		const bundle = bundles[self];

		await runActor(
			Object.assign(
				{
					self,
					msg: bundle.mailbox.shift(),
				},
				bundle,
			),
		);

		setTimeout(flush, 0, self);
		bundles[self].running = false;
	}

	function spawn(meta) {
		bundles[meta.self] = Object.assign(
			{
				mailbox: [],
				running: false,
			},
			meta,
		);

		bundles[meta.parent] = bundles[meta.parent] || {};
		bundles[meta.parent].children = Object.assign(
			{
				[meta.nickname]: meta.self,
			},
			(bundles[meta.parent] || {}).children || {},
		);
	}

	function publish(meta) {
		bundles[meta.self].state = meta.state;
		setTimeout(flush, 0, meta.self);
	}

	function dispatch(meta) {
		bundles[meta.snk].mailbox.push(Object.assign({ src: meta.src }, meta.msg));
		setTimeout(flush, 0, meta.snk);
	}

	function kill(meta) {
		bundles[meta.parent].children = Object.assign({}, bundles[meta.parent].children);
		delete bundles[meta.parent].children[bundles[meta.self].nickname];

		delete bundles[meta.self];
	}

	return {
		spawn,
		publish,
		dispatch,
		kill,
	};
}
