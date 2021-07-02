import system from "../system";

import Hand from "./Hand";
import Deck from "./Deck";

system.register(Skirmish);

export default function Skirmish(
	{ children, state, dispatch, assert, msg, log },
	[party1, party2],
) {
	switch (msg.type) {
		case "StartMulliganPhase": {
			assert(state.phase === "init");

			dispatch("render", { path: ["ui", "route"], value: `/skirmish/mulligan/${party1}` });
			dispatch("render", { path: ["skirmish", "turn"], value: party1 });

			dispatch(children.hand1, { type: "DrawCard" });
			dispatch(children.hand1, { type: "DrawCard" });
			dispatch(children.hand1, { type: "DrawCard" });

			return {
				phase: "mulligan",
				turn: party1,
			};
		}

		default: {
			log(msg);
			break;
		}
	}
}

Skirmish.startup = ({ self, dispatch, spawn }, [party1, party2]) => {
	dispatch("render", { path: ["skirmish", "addr"], value: self });
	dispatch("render", { path: ["skirmish", "parties"], value: [party1, party2] });

	spawn.hand1(Hand, spawn.deck1(Deck, party1));
	spawn.hand2(Hand, spawn.deck2(Deck, party2));

	return {
		phase: "init",
	};
};
