import system from "../system";

import PlayerActor from "./Player";
import SkirmishTurnActor from "./SkirmishTurnActor";
import HeroInstance from "./Heros";

system.register(SkirmishActor);

export default function SkirmishActor({ spawn, aquire, msg, children, dispatch, log, state = {} }) {
	aquire.player1(PlayerActor, 1);
	aquire.player2(PlayerActor, 2);
	aquire.turn(SkirmishTurnActor);

	switch (msg.type) {
		case "REQUEST_PLAYERS": {
			const { player1, player2 } = children;
			dispatch(msg.src, {
				type: "RESPOND_PLAYERS",

				player1,
				player2,
			});
			break;
		}

		case "REQUEST_TURN_INTRO": {
			const turn = aquire.turn(SkirmishTurnActor);
			dispatch(msg.src, { type: "RESPOND_TURN_INTRO", turn: children.turn || turn });
			break;
		}

		case "REQUEST_DRAUGHTABLE_HEROS": {
			dispatch(msg.src, {
				type: "RESPOND_DRAUGHTABLE_HEROS",
				heros: ["ranger", "rouge", "warrior", "wizard"],
			});
			break;
		}

		case "PLAYERS_HAVE_PICKED_HEROS": {
			for (const player of [1, 2]) {
				for (const heroType of msg.picked[player]) {
					const hero = spawn[`player${player}${heroType}`](HeroInstance, heroType);
					dispatch(children[`player${player}`], {
						type: "ASSIGN_HERO",
						hero,
					});
				}
			}
			break;
		}

		case "PLAYER_HAS_ALL_HEROS": {
			const playersWithDraughtedHeros = [...(state.playersWithDraughtedHeros || []), msg.src];

			if (playersWithDraughtedHeros.length > 1) {
				dispatch(children.turn, { type: "ADVANCE_TO_DECK_BUILD" });
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
