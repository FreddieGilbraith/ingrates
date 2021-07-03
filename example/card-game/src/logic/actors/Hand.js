import * as R from "ramda";

import system from "../system";

system.register(Hand);

export default function Hand({ state, msg, log, dispatch }, deckAddr) {
	switch (msg.type) {
		case "DrawCardFromDeckToHand": {
			log(state);
			return R.over(R.lensProp("cards"), R.append(msg.card));
		}

		case "DrawCardFromDeck": {
			dispatch(deckAddr, { type: "DrawCardToHand" });
			break;
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

