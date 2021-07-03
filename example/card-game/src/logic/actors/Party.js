import * as R from "ramda";

import system from "../system";

system.register(Party);

export default function Party({ msg, log, state, dispatch }) {
	switch (msg.type) {
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

Party.startup = ({ self, dispatch }, partyName) => {
	dispatch("render", {
		path: ["party", self, "name"],
		value: partyName,
	});
};
