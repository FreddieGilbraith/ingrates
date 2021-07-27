import * as R from "ramda";
import system from "../system";

import RenderGraph from "./RenderGraph";
import CampaignManager from "./CampaignManager";

system.register(Root);

export default function Root({ acquire, msg, log, state, dispatch, children, self }) {
	switch (msg.type) {
		case "Mount": {
			const renderGraph = acquire.renderGraph(RenderGraph);
			const campaignManager = acquire.campaignManager(CampaignManager);

			dispatch(renderGraph, { type: "Noop" });
			dispatch(campaignManager, { type: "Noop" });

			dispatch(renderGraph, { path: ["engine", "status"], value: "Loading" });
			dispatch(renderGraph, { path: ["engine", "addr"], value: self });

			return R.pipe(
				R.assocPath(["waiting", renderGraph], "renderGraph"),
				R.assocPath(["waiting", campaignManager], "campaignManager"),
			);
		}

		case "IsReady": {
			dispatch(self, { type: "CheckEngineStatus" });
			return R.dissocPath(["waiting", msg.src]);
		}

		case "CheckEngineStatus": {
			if (R.keys(state.waiting).length === 0) {
				dispatch(children.renderGraph, { path: ["engine", "status"], value: "Running" });
			}
			return;
		}

		case "RenderCampaignsList":
		case "CreateNewCampaign": {
			dispatch(children.campaignManager, msg);
			break;
		}

		default: {
			if (msg.type !== "Noop") log(msg);
			break;
		}
	}

	return state;
}
