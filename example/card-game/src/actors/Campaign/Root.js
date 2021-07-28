import * as R from "ramda";

import { register } from "./system";

register(Root);

export default function Root({ self, dispatch, msg, state, log }) {
	switch (msg.type) {
		case "Mount": {
			dispatch(self, { type: "UpdateTimestamp" });
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
			log(msg);
			break;
		}
	}
}