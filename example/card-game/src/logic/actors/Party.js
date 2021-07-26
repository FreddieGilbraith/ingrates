import * as R from "ramda";

import system from "../system";

system.register(Party);

export default function Party({ self, msg, log, state, dispatch }) {
	switch (msg.type) {
		case "Mount": {
			return R.pipe(
				R.over(R.lensProp("name"), R.defaultTo("New Party")),
				R.over(R.lensProp("members"), R.defaultTo([])),
			);
		}

		case "RequestRender": {
			dispatch("render", { path: ["party", self, "name"], value: state.name });
			dispatch("render", { path: ["party", self, "members"], value: state.members });
			break;
		}

		case "AddMembers": {
			return R.over(R.lensProp("members"), R.concat(msg.members));
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
