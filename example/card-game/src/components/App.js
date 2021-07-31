import React from "react";
import { HashRouter as Router } from "react-router-dom";

import { GameStateProvider, useGameState, useGameDispatch } from "./useGameState";
import Routes from "./Routes";
import useKeyboardFocusManager from "./useKeyboardFocusManager";

function Debug() {
	const state = useGameState((x) => x);
	const dispatch = useGameDispatch();

	React.useLayoutEffect(() => {
		window.dispatch = dispatch;
	}, [dispatch]);

	if (window.debug) {
		return <div style={{ whiteSpace: "pre" }}>{JSON.stringify(state, null, 2)}</div>;
	} else {
		return null;
	}
}

export default function App({ state, dispatch }) {
	useKeyboardFocusManager();

	return (
		<Router>
			<GameStateProvider value={{ dispatch, state }}>
				<Routes />
				<Debug />
			</GameStateProvider>
		</Router>
	);
}
