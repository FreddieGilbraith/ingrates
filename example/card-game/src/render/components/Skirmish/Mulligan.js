import React from "react";
import * as R from "ramda";

import { useGameDispatch, useGameState } from "../useGameState";
import Button from "../Button";
import { MulliganCard } from "./Card";

export default function Mulligan() {
	const dispatch = useGameDispatch();
	const turn = useGameState(R.pathOr([], ["skirmish", "turn"]));
	const hand = useGameState(R.pathOr([], ["skirmish", turn, "hand"]));
	const skirmish = useGameState(R.path(["skirmish", "addr"]));
	const [rejected, setRejected] = React.useState({});

	React.useEffect(() => setRejected({}), [turn]);

	if (hand.length !== 3) {
		return null;
	}

	return (
		<div className="flex flex-col items-center">

			<div className="flex flex-row">
				{hand.map((cardAddr, i, { length }) => (
					<MulliganCard
						nth={i}
						ofN={length}
						key={cardAddr}
						cardAddr={cardAddr}
						rejected={rejected[cardAddr]}
						onClick={setRejected.bind(null, R.over(R.lensProp(cardAddr), R.not))}
					/>
				))}
			</div>

			<Button
				move="down"
				color="blue"
				onClick={dispatch.bind(null, skirmish, {
					type: "CompleteMulliganForParty",
					party: turn,
					rejected: Object.entries(rejected)
						.filter((x) => x[1])
						.map((x) => x[0]),
				})}
			>
				Confirm
			</Button>
		</div>
	);
}
