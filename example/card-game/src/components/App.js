import React from "react";

import useActor from "./useActor";

export default function App({ rootAddr }) {
	const { self, state, dispatch } = useActor(function AppActor({ msg, dispatch, state, log }) {
		switch (msg.type) {
			case "MOUNT": {
				return {
					screen: "LOADING",
				};
			}
		}
		return state;
	});

	React.useEffect(() => {
		if (dispatch) {
			dispatch(rootAddr, { type: "RENDERER_HAS_STARTED" });
		}
	}, [dispatch, rootAddr]);

	if (!state) {
		return null;
	}

	switch (state.screen) {
		case "LOADING":
			return (
				<div>
					Loading
					<button onClick={dispatch.bind(null, self, { type: "START_LOGIN" })}>
						Login
					</button>
				</div>
			);

		default:
			return <div> unknown screen {state.screen}</div>;
	}
}
