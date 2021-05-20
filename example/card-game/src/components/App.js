import React from "react";

import createUseActor from "./useActor";

function AppActor({ state, msg, dispatch }) {}

AppActor.startup = () => ({ screen: "LOADING" });

const useActor = createUseActor(AppActor);

export default function App({ rootAddr }) {
	const { self, state, dispatch } = useActor();

	console.log({ self, state, dispatch });

	switch (state.screen) {
		case "LOADING":
			return <div>Loading</div>;

		default:
			return <div> unknown screen {state.screen}</div>;
	}
}
