import React from "react";

const GameStateContext = React.createContext({});

export function GameStateProvider({ value, children }) {
	return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
}

export function useGameState(selector) {
	const allState = React.useContext(GameStateContext).state;

	const val = selector(allState);

	return React.useMemo(() => val, [val]);
}

export function useGameDispatch() {
	return React.useContext(GameStateContext).dispatch;
}
