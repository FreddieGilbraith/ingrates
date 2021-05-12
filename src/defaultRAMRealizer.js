const spawn = 1;
const dispatch = 2;

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

	function poll() {
		if (polling || effects.length === 0) {
			return;
		}
		polling = true;

		handleEffect(...effects.shift()).then(() => {
			setTimeout(flushBuffer, 0);
			setTimeout(poll, 0);
			polling = false;
		});
	}

	function handleEffect(type, meta) {
		switch (type) {
			case spawn: {
				bundles[meta.self] = Object.assign({}, meta);

				bundles[meta.parent] = bundles[meta.parent] || {};
				bundles[meta.parent].children = Object.assign(
					{
						[meta.nickname]: meta.self,
					},
					bundles[meta.parent].children || {},
				);
				break;
			}

			case dispatch: {
				const self = meta.self;

				if (bundles[self]) {
					return runActor(
						Object.assign(
							{
								self,
								msg: meta.msg,
							},
							bundles[self],
						),
					).then((newState) => {
						(bundles[self] || {}).state = newState;
					});
				}
				break;
			}
		}
		return Promise.resolve();
	}

	function kill(meta) {
		delete bundles[meta.parent].children[bundles[meta.self].nickname];

		const children = (bundles[meta.self] && bundles[meta.self].children) || {};
		Object.values(children).forEach((child) => kill({ parent: meta.self, self: child }));

		delete bundles[meta.self];
	}

	return {
		spawn: enqueEffect.bind(null, spawn),
		dispatch: enqueEffect.bind(null, dispatch),
		kill,
	};
}
