export default function defaultRAMRealizer({ runActor, doKill }) {
	let polling = false;

	const bundles = {};

	function poll(self) {
		if (!polling && bundles[self]) {
			polling = true;

			handleMsg(bundles[self].msgs.shift()).then(() => {
				polling = false;
				setTimeout(poll, 0, self);
			});
		}
	}

	function handleMsg(input) {
		if (input && bundles[input.self]) {
			const { self, msg } = input;
			return runActor(
				Object.assign(
					{
						self,
						msg,
					},
					bundles[self],
				),
			).then((newState) => {
				(bundles[self] || {}).state = newState;
			});
		}
		return Promise.resolve();
	}

	function spawn(meta) {
		bundles[meta.self] = Object.assign({ msgs: [] }, meta);

		bundles[meta.parent] = bundles[meta.parent] || {};
		bundles[meta.parent].children = Object.assign(
			{
				[meta.nickname]: meta.self,
			},
			bundles[meta.parent].children || {},
		);
	}

	function dispatch(meta) {
		if (bundles[meta.self]) {
			bundles[meta.self].msgs.push(meta);
			setTimeout(poll, 0, meta.self);
		}
	}

	function kill(meta) {
		delete bundles[meta.parent].children[bundles[meta.self].nickname];

		const children = (bundles[meta.self] && bundles[meta.self].children) || {};
		Object.values(children).forEach((child) => kill({ parent: meta.self, self: child }));

		delete bundles[meta.self];
	}

	return {
		spawn,
		dispatch,
		kill,
	};
}
