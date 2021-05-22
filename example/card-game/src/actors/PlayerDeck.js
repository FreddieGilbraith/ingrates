import system from "../system";

system.register(PlayerDeck);

export default function PlayerDeck({ dispatch, parent, msg, log, state = { heros: [] } }) {
	switch (msg.type) {
		case "ASSIGN_HERO": {
			dispatch(msg.hero, { type: "REQUEST_FULL_DECK_CONTRIBUTION" });
			const heros = [...state.heros, msg.hero].slice(0, 2);
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
