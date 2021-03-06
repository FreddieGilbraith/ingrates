import * as R from "ramda";
import system from "../system";

import Hand from "./Hand";
import Deck from "./Deck";

system.register(Skirmish);

export default function Skirmish({ state, dispatch, self, assert, msg, log }, [party1, party2]) {
	switch (msg.type) {
		case "TransitionToNextTurn": {
			assert(msg.src === self);

			dispatch(self, { type: "UpdateRenderTurn" });
			return R.pipe(
				R.ifElse(
					R.propEq("turn", party1),
					R.assoc("turn", party2),
					R.assoc("turn", party1),
				),
				R.over(R.lensProp("round"), R.inc),
			);
		}

		case "UpdateRenderTurn": {
			dispatch("render", { path: ["skirmish", "phase"], value: state.phase });
			dispatch("render", { path: ["skirmish", "turn"], value: state.turn });
			break;
		}

		case "StartMulliganPhase": {
			assert(state.phase === "init");
			dispatch(self, { type: "TransitionToNextTurn" });
			dispatch(self, { type: "StartMulliganForCurrentParty" });
			return R.assoc("phase", "mulligan");
		}

		case "StartMulliganForCurrentParty": {
			dispatch("render", { path: ["ui", "route"], value: "/skirmish/mulligan" });
			dispatch(state.parties[state.turn].hand, { type: "DrawCardFromDeck" });
			dispatch(state.parties[state.turn].hand, { type: "DrawCardFromDeck" });
			dispatch(state.parties[state.turn].hand, { type: "DrawCardFromDeck" });
			break;
		}

		case "CompleteMulliganForParty": {
			assert(msg.party === state.turn);

			msg.rejected.forEach((card) => {
				dispatch(state.parties[state.turn].hand, { type: "ReturnCardToDeck", card });
				dispatch(state.parties[state.turn].hand, { type: "DrawCardFromDeck" });
			});

			log(msg, state.round);
			if (state.round === 1) {
				dispatch(self, { type: "TransitionToNextTurn" });
				dispatch(self, { type: "StartMulliganForCurrentParty" });
			} else if (state.round === 2) {
				dispatch(self, { type: "StartPlayPhase" });
			} else {
				assert(false, "Can't complete mulligan if turn > 2");
			}

			break;
		}

		case "StartPlayPhase": {
			assert(state.phase === "mulligan");
			dispatch(self, { type: "TransitionToNextTurn" });
			dispatch(self, { type: "StartPlayForCurrentParty" });
			return R.assoc("phase", "play");
		}

		case "StartPlayForCurrentParty": {
			dispatch("render", { path: ["ui", "route"], value: "/skirmish/play" });
			dispatch(state.parties[state.turn].hand, { type: "DrawCardFromDeck" });
		}

		default: {
			log(msg);
			break;
		}
	}

	return state;
}

Skirmish.startup = ({ self, dispatch, spawn }, [party1, party2]) => {
	dispatch("render", { path: ["skirmish", "addr"], value: self });
	dispatch("render", { path: ["skirmish", "parties"], value: [party1, party2] });

	const deck1 = spawn.deck1(Deck, party1);
	const hand1 = spawn.hand1(Hand, deck1, party1);

	const deck2 = spawn.deck2(Deck, party2);
	const hand2 = spawn.hand2(Hand, deck2, party2);

	return {
		phase: "init",
		round: 0,
		parties: {
			[party1]: { deck: deck1, hand: hand1 },
			[party2]: { deck: deck2, hand: hand2 },
		},
	};
};
