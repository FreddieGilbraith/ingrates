import React from "react";
import { Link } from "react-router-dom";

import { useGameDispatch, useGameState } from "./useGameState";

import Button from "./Button";

export default function SelectCampaign() {
	const engineAddr = useGameState((s) => s.engine.addr);
	const campaigns = useGameState((s) => s.engine.campaigns);
	const dispatch = useGameDispatch();

	React.useEffect(() => {
		if (campaigns === undefined) {
			dispatch(engineAddr, { type: "RenderCampaignsList" });
		}
	}, [campaigns, engineAddr, dispatch]);

	return (
		<React.Fragment>
			<div className="absolute inset-2 border-2 rounded border-black shadow-inner" />
			<div className="absolute inset-2 flex flex-col items-center p-2">
				<h1 className="text-xl font-bold">Campaigns</h1>

				<ol className="p-6">
					{(campaigns || []).map((campaignAddr) => (
						<li key={campaignAddr} className="p-6 flex items-center">
							<Button
								as={Link}
								className="font-mono"
								color="blue"
								move="down"
								to={`/campaign/${campaignAddr}`}
							>
								{campaignAddr}
							</Button>

							<div className="px-2" />

							<Button
								color="red"
								move="wild"
								onClick={dispatch.bind(null, engineAddr, {
									type: "DeleteCampaign",
									campaignAddr,
								})}
							>
								✕
							</Button>
						</li>
					))}
				</ol>

				<Button
					color="green"
					move="down"
					onClick={dispatch.bind(null, engineAddr, { type: "CreateNewCampaign" })}
				>
					Start New Campaign
				</Button>
			</div>
		</React.Fragment>
	);
}
