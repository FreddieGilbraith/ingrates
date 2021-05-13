const spawn = 1;
const dispatch = 2;
const kill = 3;

export default function defaultRAMRealizer({ runActor, doKill }) {
	let polling = false;
	const bundles = {};
	const effects = [];
	const effectsBuffer = [];

	function enqueEffect(type, meta) {
		if (type !== spawn && (!bundles[meta.self] || !("state" in bundles[meta.self]))) {
			effectsBuffer.push([type, meta]);
			return true;
		}

		effects.push([type, meta]);
		setTimeout(poll, 0);
		return true;
	}

	function flushBuffer() {
		let effect;
		while ((effect = effectsBuffer.shift())) {
			setTimeout(enqueEffect, 0, ...effect);
		}
	}

	async function poll() {
		if (polling || effects.length === 0) {
			return;
		}
		polling = true;

		await handleEffect(...effects.shift());

		setTimeout(flushBuffer, 0);
		setTimeout(poll, 0);
		polling = false;
	}

	async function handleEffect(type, meta) {
		switch (type) {
			case spawn: {
				bundles[meta.self] = Object.assign({}, meta);

				bundles[meta.parent] = bundles[meta.parent] || {};
				bundles[meta.parent].children = Object.assign(
					{
						[meta.nickname]: meta.self,
					},
					(bundles[meta.parent] || {}).children || {},
				);
				break;
			}

			case dispatch: {
				const self = meta.self;
				if (bundles[self]) {
					bundles[self].state = await runActor(
						Object.assign(
							{
								self,
								msg: meta.msg,
							},
							bundles[self],
						),
					);
				}
				break;
			}

			case kill: {
				if (bundles[meta.parent]) {
					delete bundles[meta.parent].children[bundles[meta.self].nickname];
				}

				const children = bundles[meta.self].children;
				Object.values(children || {}).forEach((child) => doKill(meta.self, child));

				delete bundles[meta.self];
				break;
			}
		}
	}

	return {
		spawn: enqueEffect.bind(null, spawn),
		dispatch: enqueEffect.bind(null, dispatch),
		kill: enqueEffect.bind(null, kill),
	};
}
