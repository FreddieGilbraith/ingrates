import React from "react";

import { Link } from "react-router-dom";

import { useGameDispatch, useGameState } from "./useGameState";
import { CampaignWrapper } from "./Wrapper";
import Button from "./Button";

function PartyListItem({ partyAddr, campaignAddr }) {
	const partyInfo = useGameState((s) => s.party?.[partyAddr]);
	const dispatch = useGameDispatch();

	React.useEffect(() => {
		dispatch(partyAddr, { type: "RequestRender" });
	}, [dispatch, partyAddr]);

	return (
		<div className="p-2">
			<Link
				data-keyboard-focusable
				className="p-2 border-2 border-black shadow rounded block"
				to={`/campaign/${campaignAddr}/config/party/${partyAddr}`}
			>
				<h3 className="text-lg border-b-2 border-black">{partyInfo?.name}</h3>
			</Link>
		</div>
	);
}

export default function CampaignPartyConfig({
	match: {
		params: { campaign: campaignAddr, partyAddr },
	},
}) {
	const parties = useGameState((s) => s.campaign?.[campaignAddr]?.parties ?? []);
	const campaignInfo = useGameState((s) => s.campaign?.[campaignAddr]);
	const dispatch = useGameDispatch();

	React.useEffect(() => {
		dispatch(campaignAddr, { type: "RequestRender" });
	}, [dispatch, campaignAddr]);

	return (
		<CampaignWrapper>
			<h2 className="text-xl">Parties</h2>

			<ol className="p-2">
				{parties.map((partyAddr) => (
					<li key={partyAddr}>
						<PartyListItem partyAddr={partyAddr} campaignAddr={campaignAddr} />
					</li>
				))}
			</ol>

			<Button
				color="green"
				move="down"
				onClick={dispatch.bind(null, campaignAddr, { type: "CreateNewParty" })}
				onKeyDown={console.bind}
			>
				Create New Party
			</Button>

			<div className="py-2" />

			<Button color="red" move="down" as={Link} to={`/campaign/${campaignAddr}`}>
				Back
			</Button>
		</CampaignWrapper>
	);
}
