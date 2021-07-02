import React from "react";
import { useHistory, Route } from "react-router-dom";

import { useGameState } from "./useGameState";

import Skirmish from "./Skirmish";

function BrowserRouteDriver() {
	const route = useGameState((s) => s.ui.route);
	const history = useHistory();

	React.useEffect(() => {
		history.push(route);
	}, [route, history]);

	return null;
}

function Loading() {
	return <div>Loading...</div>;
}

export default function Routes() {
	return (
		<React.Fragment>
			<BrowserRouteDriver />
			<Route path="/skirmish" component={Skirmish} />
			<Route path="/loading" component={Loading} />
		</React.Fragment>
	);
}
