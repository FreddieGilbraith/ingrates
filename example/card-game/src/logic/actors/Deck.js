import * as R from "ramda";
import system from "../system";

system.register(Deck);

export default function Deck({ self, msg, log, state, dispatch }, partyAddr) {
	switch (msg.type) {
		case "DrawCardToHand": {
			if (state.cards.length === 0) {
				log("no cards left to draw");
			}

			const cardIndex = Math.floor(Math.random() * state.cards.length);

			dispatch(msg.src, { type: "DrawCardFromDeckToHand", card: state.cards[cardIndex] });
			dispatch(self, { type: "UpdateRender" });

			return R.over(R.lensProp("cards"), R.remove(cardIndex, 1));
		}

		case "ReturnCardToDeck": {
			dispatch(self, { type: "InsertCardsIntoDeck", cards: [msg.card] });
			break;
		}

		case "InsertCardsIntoDeck": {
			msg.cards.forEach((c) => dispatch(c, { type: "InformRenderer" }));
			dispatch(self, { type: "UpdateRender" });
			return R.over(R.lensProp("cards"), R.concat(msg.cards));
		}

		case "UpdateRender": {
			dispatch("render", {
				path: ["skirmish", partyAddr, "inDeck"],
				value: state.cards.length,
			});
			break;
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
