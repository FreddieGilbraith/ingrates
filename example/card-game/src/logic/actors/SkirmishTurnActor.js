import system from "../system";

system.register(SkirmishTurnActor);

export default function SkirmishTurnActor({
	log,
	msg,
	self,
	dispatch,
	state = { section: "SETUP", phase: "PICK_HEROS", player: 0, turn: 0, subscribers: [] },
}) {
	switch (msg.type) {
		case "REQUEST_CURRENT_TURN": {
			dispatch(msg.src, {
				type: "RESPOND_CURRENT_TURN",
				section: state.section,
				phase: state.phase,
				player: state.player,
			});
			break;
		}

		case "SUBSCRIBE_TO_TURN_CHANGE": {
			return {
				...state,
				subscribers: [...(state.subscribers || []), msg.src],
			};
		}

		case "ADVANCE_TO_DECK_BUILD": {
			if (state.section === "SETUP" && state.phase === "PICK_HEROS") {
				dispatch(self, { type: "UPDATE_SUBSCRIBERS" });
				return {
					...state,
					phase: "DECK_BUILD",
				};
			}
		}

		case "UPDATE_SUBSCRIBERS": {
			for (const src of state.subscribers) {
				dispatch(self, { type: "REQUEST_CURRENT_TURN", src });
			}
			break;
		}

		default: {
			log(msg);
			break;
		}
	}

	return state;
}
