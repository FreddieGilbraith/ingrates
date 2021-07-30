import * as R from "ramda";

import { register } from "./system";

register(Root);

export default function Root({ self, dispatch, msg, state, log }) {
	log(msg);

	switch (msg.type) {
		case "Mount": {
			dispatch(self, { type: "UpdateTimestamp" });
			break;
		}

		case "Ping": {
			dispatch(msg.src, { type: "Pong" });
			break;
		}

		case "UpdateTimestamp": {
			dispatch(self, { type: "UpdateRender" });
			return R.assoc("timestamp", new Date().toISOString());
		}

		case "UpdateRender": {
			dispatch("Engine:render", { path: ["campaign", "timestamp"], value: state.timestamp });
			break;
		}

		default: {
			if (msg.type !== "Start" && msg.type !== "Mount") log(msg);
			break;
		}
	}
}
