import system from "../system";

import PlayerDeck from "./PlayerDeck";

system.register(PlayerActor);

export default function PlayerActor({
	children,
	aquire,
	spawn,
	dispatch,
	parent,
	msg,
	log,
	state = { heros: [] },
}) {
	aquire.deck(PlayerDeck);

	switch (msg.type) {
		case "ASSIGN_HERO": {
			dispatch(children.deck, msg);

			const heros = [...state.heros, msg.hero].slice(0, 2);

			if (heros.length > 1) {
				dispatch(parent, { type: "PLAYER_HAS_ALL_HEROS" });
			}

			return {
				...state,
				heros,
			};
		}

		default: {
			log(msg);
			break;
		}
	}

	return state;
}
