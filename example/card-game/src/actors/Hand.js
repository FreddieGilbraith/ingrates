import * as R from "ramda";

import system from "../system";

system.register(Hand);

export default function Hand({ self, state, msg, log, dispatch }, deckAddr, partyAddr) {
	switch (msg.type) {
		case "UpdateRender": {
			dispatch("render", { path: ["skirmish", partyAddr, "hand"], value: state.cards });
			break;
		}

		case "DrawCardFromDeckToHand": {
			dispatch(self, { type: "UpdateRender" });
			return R.over(R.lensProp("cards"), R.append(msg.card));
		}

		case "DrawCardFromDeck": {
			dispatch(deckAddr, { type: "DrawCardToHand" });
			break;
		}

		case "ReturnCardToDeck": {
			dispatch(deckAddr, msg);
			dispatch(self, { type: "UpdateRender" });
			return R.over(R.lensProp("cards"), R.without([msg.card]));
		}

		default: {
			log(msg);
			break;
		}
	}
	return state;
}

Hand.startup = () => {
	return {
		cards: [],
	};
};

