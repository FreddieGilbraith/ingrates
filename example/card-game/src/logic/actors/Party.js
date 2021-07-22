import * as R from "ramda";

import system from "../system";

system.register(Party);

export default function Party({ self, msg, log, state, dispatch }, partyName) {
	switch (msg.type) {
		case "Mount": {
			dispatch("render", {
				path: ["party", self, "name"],
				value: partyName,
			});
		}

		case "AddMembers": {
			return R.over(R.lensProp("members"), R.pipe(R.defaultTo([]), R.concat(msg.members)));
		}

		case "RequestCardsToBuildSkirmishDeck": {
			state.members.forEach((m) => dispatch(m, msg));
			break;
		}

		default: {
			log(msg);
			break;
		}
	}

	return state;
}
