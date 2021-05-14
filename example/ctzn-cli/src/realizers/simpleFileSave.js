import mkdirp from "mkdirp";

import logEnhancer from "../enhancers/log.js";

export default function createFileSaveRealizer(basePath) {
	function ActorPersisterActor(
		{ msg, log, name },
		{ parent, nickname, self, args, state: initialState },
	) {
		switch (msg.type) {
			case "MOUNT": {
				break;
			}
		}
	}

	function RootActor({ msg, log, spawn, dispatch, children }) {
		log({ spawn, children, msg });
		switch (msg.type) {
			case "SPAWN": {
				const addr = spawn[msg.meta.self](ActorPersisterActor, msg.meta);
				dispatch(addr, { type: "MOUNT", meta: msg.meta });
				break;
			}
			case "DISPATCH": {
				dispatch(children[msg.meta.self], msg);
				break;
			}
		}
	}

	return function ingratesRealizerFileSave({ runActor, doKill, createActorSystem }) {
		const system = createActorSystem({ enhancers: [logEnhancer("fileRealizer")] });
		system.register(RootActor);
		system.register(ActorPersisterActor);
		const rootAddr = system.spawn.root(RootActor);

		return {
			dispatch: (meta) => system.dispatch(rootAddr, { type: "DISPATCH", meta }),
			kill: (meta) => system.dispatch(rootAddr, { type: "KILL", meta }),
			spawn: (meta) => system.dispatch(rootAddr, { type: "SPAWN", meta }),
		};
	};
}
