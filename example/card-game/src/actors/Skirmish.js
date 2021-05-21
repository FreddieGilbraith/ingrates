import system from "../system";

import PlayerActor from "./Player";
import SkirmishTurnActor from "./SkirmishTurnActor";
import HerosActor from "./Heros";

system.register(SkirmishActor);

export default function SkirmishActor({ aquire, msg, children, dispatch, log, state = {} }) {
	aquire.player1(PlayerActor);
	aquire.player2(PlayerActor);
	aquire.turn(SkirmishTurnActor);
	aquire.heros(HerosActor);

	switch (msg.type) {
		case "REQUEST_TURN_INTRO": {
			dispatch(msg.src, { type: "RESPOND_TURN_INTRO", turn: children.turn });
			break;
		}

		case "REQUEST_DRAUGHTABLE_HEROS": {
			dispatch(children.heros, msg);
			break;
		}

		case "PLAYERS_HAVE_PICKED_HEROS": {
			for (const player of [1, 2]) {
				for (const heroType of msg.picked[player]) {
					dispatch(children.heros, {
						type: "GENERATE_AND_ASSIGN_HERO",
						player: children[`player${player}`],
						heroType,
					});
				}
			}
			break;
		}

		case "PLAYER_HAS_ALL_HEROS": {
			const playersWithDraughtedHeros = [...(state.playersWithDraughtedHeros || []), msg.src];

			if (playersWithDraughtedHeros.length > 1) {
				dispatch(children.turn, { type: "ADVANCE_TO_CARD_DRAW" });
			}

			return {
				...state,
				playersWithDraughtedHeros,
			};
		}

		default: {
			log(msg);
			break;
		}
	}

	return state;
}
