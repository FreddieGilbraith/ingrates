import * as R from "ramda";
import system from "../system";

import Campaign from "./Campaign";

system.register(CampaignManager);

export default function CampaignManager({ self, spawn, parent, msg, log, dispatch, state = {} }) {
	switch (msg.type) {
		case "Mount": {
			dispatch(parent, { type: "IsReady" });
			dispatch(self, { type: "RenderCampaignsList" });
			break;
		}

		case "RenderCampaignsList": {
			dispatch("render", { path: ["engine", "campaigns"], value: state.campaigns || [] });
			break;
		}

		case "CreateNewCampaign": {
			dispatch(self, { type: "RenderCampaignsList" });
			return R.over(
				R.lensProp("campaigns"),
				R.pipe(R.defaultTo([]), R.append(spawn(Campaign))),
			);
		}

		default: {
			if (msg.type !== "Noop") log(msg);
			break;
		}
	}
}

