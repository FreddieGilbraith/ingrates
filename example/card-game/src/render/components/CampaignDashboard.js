import React from "react";

import { useRouteMatch } from "react-router";

import { useGameDispatch, useGameState } from "./useGameState";
import Wrapper from "./Wrapper";

export default function CampaignDashboard() {
	const {
		params: { campaignAddr },
	} = useRouteMatch("/campaign/:campaignAddr");
	const campaignInfo = useGameState((s) => s.campaign?.[campaignAddr]);
	const dispatch = useGameDispatch();

	React.useEffect(() => {
		dispatch(campaignAddr, { type: "RequestRender" });
	}, [dispatch, campaignAddr]);

	return (
		<Wrapper
			title="Campaign Dashboard"
			subtitle={<div>last update: {campaignInfo?.timestamp}</div>}
		></Wrapper>
	);
}
