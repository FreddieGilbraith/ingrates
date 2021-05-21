import React from "react";

import useActor from "./useActor";
import GamePlay from "./GamePlay";

export default function App({ rootAddr }) {
	const { self, state, dispatch } = useActor(function AppActor({ msg, dispatch, state, log }) {
		switch (msg.type) {
			case "MOUNT": {
				return {
					screen: "LOADING",
				};
			}

			case "INTRO_SESSION": {
				dispatch(msg.session, { type: "REQUEST_CURRENT_GAME_STATUS" });
				return {
					...state,
					session: msg.session,
				};
			}

			case "RESPOND_CURRENT_GAME_STATUS": {
				return {
					...state,
					screen: msg.gameRunningStatus,
					skirmish: msg.skirmish,
				};
			}

			case "START_SKIRMISH": {
				dispatch(state.session, msg);
				dispatch(state.session, { type: "REQUEST_CURRENT_GAME_STATUS" });
				break;
			}

			default: {
				log(msg);
				break;
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
		case "NO_GAME":
			return (
				<div className="flex flex-col items-center justify-center h-full">
					<h1 className="text-6xl pb-8">No Game In Progress</h1>
					<button
						className="border rounded shadow px-4 py-2 text-3xl"
						onClick={dispatch.bind(null, self, { type: "START_SKIRMISH" })}
					>
						Start Game
					</button>
				</div>
			);

		case "RUNNING": {
			return <GamePlay session={state.session} skirmish={state.skirmish} />;
		}

		default:
			return <div> unknown screen {state.screen}</div>;
	}
}
