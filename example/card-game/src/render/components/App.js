import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import { GameStateProvider } from "./useGameState";
import Routes from "./Routes";

export default function App({ state, dispatch }) {
	React.useEffect(() => {
		if (state?.engine?.addr) {
			dispatch(state.engine.addr, {
				type: "RenderReady",
			});
		}
	}, [state?.engine?.addr]);

	return (
		<Router>
			<GameStateProvider value={{ dispatch, state }}>
				<Routes />
				{/*
				<div style={{ whiteSpace: "pre" }}>{JSON.stringify(state, null, 2)}</div>
				*/}
			</GameStateProvider>
		</Router>
	);
}
