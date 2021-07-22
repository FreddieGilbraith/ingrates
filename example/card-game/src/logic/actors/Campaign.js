import * as R from "ramda";

import system from "../system";

system.register(Campaign);

export default function Campaign({ parent, msg, log, dispatch, self }) {
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
			break;
		}

		default: {
			if (msg.type !== "Noop") log(msg);
			break;
		}
	}
}
