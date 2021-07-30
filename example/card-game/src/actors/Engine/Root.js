import * as R from "ramda";

import RenderGraph from "./RenderGraph";
import CampaignManager from "./CampaignManager";

import { register } from "./system";

register(Root);

export default function Root(
	{ state, children, log, spawn, self, msg, dispatch },
	configAddr,
	createDynamicSystemTransport,
) {
	switch (msg.type) {
		case "Mount": {
			const renderAddr = spawn.render(RenderGraph);
			const campaignManagerAddr = spawn.campaignManager(
				CampaignManager,
				createDynamicSystemTransport,
			);

			dispatch(configAddr, { type: "IntroEngine" });
			dispatch(renderAddr, { type: "IntroEngine" });
			dispatch(campaignManagerAddr, { type: "IntroEngine" });

			return R.pipe(
				R.assocPath(["startup", "waitingFor", configAddr], "configRoot"),
				R.assocPath(["startup", "waitingFor", renderAddr], "renderGraph"),
				R.assocPath(["startup", "waitingFor", campaignManagerAddr], "campaignManager"),
			);
		}

		case "ConfirmStartup": {
			dispatch(self, { type: "CheckStartup" });
			return R.dissocPath(["startup", "waitingFor", msg.src]);
		}

		case "CheckStartup": {
			if (Object.keys(state.startup.waitingFor).length === 0) {
				log("EngineStartup!");
				dispatch("render", { path: ["engine", "addr"], value: self });
				dispatch("render", { path: ["engine", "status"], value: "Running" });
			} else {
				log("CheckStartup", state.startup.waitingFor);
			}

			break;
		}

		case "CreateNewCampaign":
		case "MountCampaign":
		case "RenderCampaignsList": {
			dispatch(children.campaignManager, msg);
			break;
		}

		default: {
			if (msg.type !== "Start" && msg.type !== "Mount") log(msg);
			break;
		}
	}
}
