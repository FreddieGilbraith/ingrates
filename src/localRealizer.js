export default function localRealizer({ doSpawn, doDispatch, runActor, getProvisionsForActor }) {
	const argss = {};
	const name = {};
	const running = {};
	const mailbox = {};
	const children = {};
	const parent = {};
	const states = {};
	const nicknames = {};

	async function flush(self) {
		if (running[self] || mailbox[self].length === 0) {
			return;
		}

		await runActor({
			self,
			msg: mailbox[self].shift(),
			state: states[self],
			parent: parent[self],
			name: name[self],
			children: children[self],
			args: argss[self],
		});

		setTimeout(flush, 0, self);
	}

	function spawn(meta) {
		name[meta.self] = meta.name;
		argss[meta.self] = meta.args;
		mailbox[meta.self] = [];
		running[meta.self] = false;
		parent[meta.self] = meta.parent;
		nicknames[meta.self] = meta.nickname;
		children[meta.parent] = Object.assign(
			{
				[meta.nickname]: meta.self,
			},
			children[meta.parent],
		);
	}

	function publish(meta) {
		states[meta.self] = meta.state;
	}

	function dispatch(meta) {
		mailbox[meta.snk].push(Object.assign({ src: meta.src }, meta.msg));
		setTimeout(flush, 0, meta.snk);
	}

	function kill(meta) {
		delete name[meta.self];
		delete argss[meta.self];
		delete mailbox[meta.self];
		delete running[meta.self];
		delete parent[meta.self];

		const nickname = nicknames[meta.self];
		delete nicknames[meta.self];

		children[meta.parent] = Object.assign({}, children[meta.parent]);
		delete children[meta.parent][nickname];
	}

	return {
		spawn,
		publish,
		dispatch,
		kill,
	};
}
