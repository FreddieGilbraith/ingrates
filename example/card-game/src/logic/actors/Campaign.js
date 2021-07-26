import * as R from "ramda";

import system from "../system";
import Party from "./Party";

system.register(Campaign);

export default function Campaign({ spawn, state, parent, msg, log, dispatch, self }) {
	if (msg.type === "UpdateTimestamp") {
		const timestamp = new Date().toISOString();
		dispatch("render", { path: ["campaign", self, "timestamp"], value: timestamp });
		return R.assoc("timestamp", timestamp);
	} else {
		dispatch(self, { type: "UpdateTimestamp" });
	}

	switch (msg.type) {
		case "Mount": {
			dispatch(parent, { type: "IsReady" });
			return R.pipe(R.over(R.lensProp("parties"), R.defaultTo([])));
		}

		case "CreateNewParty": {
			dispatch(self, { type: "RequestRender" });
			return R.pipe(R.over(R.lensProp("parties"), R.append(spawn(Party))));
		}

		case "RequestRender": {
			dispatch("render", { path: ["campaign", self, "parties"], value: state.parties });
			break;
		}

		default: {
			if (msg.type !== "Noop") log(msg);
			break;
		}
	}
}
