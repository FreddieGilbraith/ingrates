import * as R from "ramda";
import system from "../system";

import Session from "./Session";
import Campaign from "./Campaign";
import RenderGraph from "./RenderGraph";

system.register(Root);

export default function Root({ acquire, msg, log, state, dispatch, children, self }) {
	switch (msg.type) {
		case "FirstSystemMount": {
			acquire.renderGraph(RenderGraph);

			dispatch("render", { path: ["ui", "route"], value: "/loading" });
			dispatch("render", { path: ["engine", "addr"], value: self });
			dispatch("render", { path: ["engine", "status"], value: "init" });

			const session = acquire.session(Session);
			const campaign = acquire.campaign(Campaign);

			return { waiting: { [session]: "session", [campaign]: "campaign" } };
		}

		// case "Ready": {
		// 	dispatch(self, { type: "CheckAllReady" });
		// 	return R.dissocPath(["waiting", msg.src]);
		// }

		// case "CheckAllReady": {
		// 	if (Object.keys(state.waiting).length === 0) {
		// 		dispatch("render", { path: ["engine", "status"], value: "running" });
		// 		dispatch("render", { path: ["ui", "route"], value: "/skirmish/start" });
		// 		dispatch(children.session, { type: "BeginSkirmish", campaign: children.campaign });
		// 	}
		// 	break;
		// }

		default: {
			log(msg);
			break;
		}
	}

	return state;
}
