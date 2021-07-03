import * as R from "ramda";
import system from "../system";

system.register(Deck);

export default function Deck({ msg, log, state, dispatch }) {
	switch (msg.type) {
		case "DrawCardToHand": {
			if (state.cards.length === 0) {
				log("no cards left to draw");
			}

			const cardIndex = Math.floor(Math.random() * state.cards.length);

			dispatch(msg.src, { type: "DrawCardFromDeckToHand", card: state.cards[cardIndex] });

			return R.over(R.lensProp("cards"), R.remove(cardIndex, 1));
		}

		case "InsertCardsIntoDeck": {
			msg.cards.forEach((c) => dispatch(c, { type: "InformRenderer" }));
			return R.over(R.lensProp("cards"), R.concat(msg.cards));
		}

		default: {
			log(msg);
			break;
		}
	}
	return state;
}

Deck.startup = ({ dispatch }, partyAddr) => {
	dispatch(partyAddr, { type: "RequestCardsToBuildSkirmishDeck" });
	return {
		cards: [],
	};
};
