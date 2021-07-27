import * as R from "ramda";

import { register } from "./system";

register(Root);

export default function Root({ log, self, msg, dispatch }, configAddr) {
	switch (msg.type) {
		case "Mount": {
			dispatch(configAddr, { type: "IntroEngine" });

			return R.pipe(R.assocPath(["startup", "waitingFor", configAddr], "configRoot"));
		}

		case "ConfirmStartup": {
			dispatch(self, { type: "LogState" });
			return R.dissocPath(["startup", "waitingFor", msg.src]);
		}

		case "LogState": {
			return R.tap(console.log);
		}

		default: {
			log(msg);
			break;
		}
	}
}
