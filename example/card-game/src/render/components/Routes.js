import React from "react";
import { Switch, useHistory, Route } from "react-router-dom";

import { useGameState } from "./useGameState";

import Skirmish from "./Skirmish";
import SelectCampaign from "./SelectCampaign";
import CampaignDashboard from "./CampaignDashboard";

function Loading() {
	const history = useHistory();
	const engineStatus = useGameState((s) => s.engine.status);

	React.useEffect(() => {
		if (engineStatus === "Running") {
			history.push("/campaign");
		}
	}, [history, engineStatus]);

	return <div>Loading...</div>;
}

function Noop() {
	return null;
}

export default function Routes() {
	return (
		<React.Fragment>
			<Switch>
				<Route path="/campaign/:campaign/config/party" component={Noop} />
				<Route path="/campaign/:campaign/config/party/:partyId" component={Noop} />
				<Route path="/campaign/:campaign/skirmish" component={Skirmish} />
				<Route path="/campaign/:campaign" component={CampaignDashboard} />

				<Route path="/campaign" component={SelectCampaign} />

				<Route component={Loading} />
			</Switch>
		</React.Fragment>
	);
}
