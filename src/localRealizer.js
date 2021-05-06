export default function localRealizer({ doSpawn, doDispatch, runActor, getProvisionsForActor }) {
	const name = {};
	const running = {};
	const mailbox = {};
	const children = {};
	const parent = {};
	const state = {};

	async function flush(self) {
		if (running[self]) {
			return;
		}

		if (mailbox[self].length === 0) {
			return;
		}

		await runActor({
			self,
			parent: parent[self],
			name: name[self],
			msg: mailbox[self].shift(),
			state: state[self],
			children: children[self],
		});

		setTimeout(flush, 0, self);
	}

	function update(event, meta) {
		console.log(JSON.stringify([...arguments]));

		switch (event) {
			case "spawn": {
				name[meta.self] = meta.name;
				mailbox[meta.self] = [];
				running[meta.self] = false;
				parent[meta.self] = meta.parent;
				children[meta.parent] = {
					...children[meta.parent],
					[meta.nickname]: meta.self,
				};

				break;
			}

			case "publish": {
				state[meta.self] = meta.state;
				break;
			}

			case "dispatch": {
				mailbox[meta.snk].push(Object.assign({ src: meta.src }, meta.msg));
				flush(meta.snk);
				break;
			}
		}

		return true;
	}

	return {
		update,
	};
}
