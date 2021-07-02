import * as R from "ramda";

import system from "../system";

system.register(Party);

export default function Party({ msg, log, dispatch }) {
	switch (msg.type) {
		case "AddMembers": {
			msg.members.forEach((x) => dispatch(x, { type: "RequestCardDefinitions" }));
			return R.over(R.lensProp("members"), R.pipe(R.defaultTo([]), R.concat(msg.members)));
		}

		default: {
			log(msg);
			break;
		}
	}
}

Party.startup = ({ self, dispatch }, partyName) => {
	dispatch("render", {
		path: ["party", self, "name"],
		value: partyName,
	});
};
