import system from "../system";

system.register(PlayerActor);

export default function PlayerActor({ dispatch, parent, msg, log, state = { heros: [] } }) {
	switch (msg.type) {
		case "ASSIGN_HERO": {
			const heros = [...state.heros, msg.hero];

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
}
