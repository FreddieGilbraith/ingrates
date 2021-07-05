import React from "react";
import * as R from "ramda";
import { useGameDispatch, useGameState } from "../useGameState";

import { HandCard } from "./Card";

function Board() {
	return <div className="flex-1" />;
}

function Hand() {
	const dispatch = useGameDispatch();
	const skirmish = useGameState(R.path(["skirmish", "addr"]));
	const turn = useGameState(R.pathOr([], ["skirmish", "turn"]));
	const hand = useGameState(R.pathOr([], ["skirmish", turn, "hand"]));

	console.log({ hand });

	return (
		<div className="flex">
			{hand.map((cardAddr, i, { length }) => (
				<HandCard
					nth={i}
					ofN={length}
					key={cardAddr}
					cardAddr={cardAddr}
					onClick={console.log.bind(null, "onClick", cardAddr)}
				/>
			))}
		</div>
	);
}
export default function Play() {
	return (
		<React.Fragment>
			<Board />
			<Hand />
		</React.Fragment>
	);
}
