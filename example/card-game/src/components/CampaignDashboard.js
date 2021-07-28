import React from "react";

import { Link } from "react-router-dom";

import { useGameDispatch, useGameState } from "./useGameState";
import Wrapper from "./Wrapper";
import Button from "./Button";

export default function CampaignDashboard({
	match: {
		params: { campaign },
	},
}) {
	const campaignAddr = useGameState((s) => s.campaign?.addr);
	const campaignTimestamp = useGameState((s) => s.campaign?.timestamp);
	const dispatch = useGameDispatch();

	return (
		<Wrapper title="Campaign Dashboard" subtitle={<div>last update: {campaignTimestamp}</div>}>
			<div className="flex-1 flex flex-row self-stretch items-stretch">
				<div className="flex-1 flex flex-col items-center justify-center">
					<Button color="green" move="wild">
						Play
					</Button>
				</div>

				<div className="flex-1 flex flex-col ">
					<div className="flex-1 flex flex-col items-center justify-center">
						<Button
							move="wild"
							color="blue"
							as={Link}
							to={`/campaign/${campaign}/config/party`}
						>
							Parties
						</Button>
					</div>

					<div className="flex-1 flex flex-col items-center justify-center">
						<Button color="blue" move="wild">
							Config
						</Button>
					</div>

					<div className="flex-1 flex flex-col items-center justify-center">
						<Button
							color="blue"
							move="wild"
							onClick={dispatch.bind(null, campaignAddr, { type: "UpdateTimestamp" })}
						>
							Poke
						</Button>
					</div>
				</div>
			</div>
		</Wrapper>
	);
}
