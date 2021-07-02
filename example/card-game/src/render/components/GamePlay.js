import React from "react";

import useActor from "./useActor";
import PickHeros from "./PickHeros";
import DeckBuild from "./DeckBuild";

export default function GamePlay({ skirmish }) {
	const { self, state } = useActor(function ({ self, msg, dispatch, state = {}, log }) {
		switch (msg.type) {
			case "MOUNT": {
				dispatch(skirmish, { type: "REQUEST_TURN_INTRO" });
				break;
			}

			case "REFRESH_VIEW": {
				dispatch(state.turn, { type: "REQUEST_CURRENT_TURN" });
				break;
			}

			case "RESPOND_TURN_INTRO": {
				dispatch(msg.turn, { type: "SUBSCRIBE_TO_TURN_CHANGE" });
				dispatch(msg.turn, { type: "REQUEST_CURRENT_TURN" });
				return {
					...state,
					turn: msg.turn,
				};
				break;
			}

			case "RESPOND_CURRENT_TURN": {
				return {
					...state,
					view: msg.phase,
				};
				break;
			}

			default: {
				log(msg);
				break;
			}
		}

		return state;
	});

	if (!state) {
		return null;
	}

	switch (state.view) {
		case "PICK_HEROS": {
			return <PickHeros gamePlayActor={self} skirmish={skirmish} />;
		}

		case "DECK_BUILD": {
			return <DeckBuild gamePlayActor={self} skirmish={skirmish} />;
		}

		default: {
			return null;
		}
	}
}
