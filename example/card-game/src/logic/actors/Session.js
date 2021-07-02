import system from "../system";

import SkirmishActor from "./Skirmish";

system.register(SessionActor);

export default async function SessionActor({ self, aquire, msg, dispatch, children, state, log }) {
	switch (msg.type) {
		case "REQUEST_CURRENT_GAME_STATUS": {
			dispatch(msg.src, {
				type: "RESPOND_CURRENT_GAME_STATUS",
				gameRunningStatus: children.skirmish ? "RUNNING" : "NO_GAME",
				skirmish: children.skirmish,
			});
			break;
		}

		case "START_SKIRMISH": {
			aquire.skirmish(SkirmishActor);
			dispatch(self, { type: "REQUEST_CURRENT_GAME_STATUS", src: msg.src });
		}

		default: {
			log(msg);
			break;
		}
	}

	return state;
}
