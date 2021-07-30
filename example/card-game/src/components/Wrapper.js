import React from "react";
import { useHistory } from "react-router-dom";

import { useGameState } from "./useGameState";
import Button from "./Button";

export default function Wrapper({ title, subtitle, children }) {
	return (
		<React.Fragment>
			<div className="absolute inset-2 border-2 rounded border-black shadow-inner" />
			<div className="absolute inset-2 flex flex-col items-center p-2">
				<h1 className="text-xl font-bold">{title}</h1>
				{subtitle}
				<div className="flex-1 flex flex-col items-center justify-center self-stretch">
					{children}
				</div>
			</div>
		</React.Fragment>
	);
}

export function CampaignWrapper({ children }) {
	const history = useHistory();
	const campaignTimestamp = useGameState((s) => s.campaign?.timestamp);

	return (
		<Wrapper title="Campaign Dashboard" subtitle={<div>last update: {campaignTimestamp}</div>}>
			<div className="self-start">
				<Button
					data-keyboard-focusable="esc"
					move="up"
					color="red"
					to="campaign"
					onClick={history.goBack}
				>
					&#9668;
				</Button>
			</div>
			{children}
		</Wrapper>
	);
}
