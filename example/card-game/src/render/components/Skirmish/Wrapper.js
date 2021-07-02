import React from "react";
import cn from "classnames";
import * as R from "ramda";
import { useRouteMatch } from "react-router";

import { useGameDispatch, useGameState } from "../useGameState";

function PartyDisplay({ partyAddr }) {
	const party = useGameState(R.path(["party", partyAddr]));
	const turn = useGameState(R.path(["skirmish", "turn"]));

	if (!party) {
		return null;
	}

	return (
		<h3
			className={cn(
				"px-4",
				"py-2",
				"text-lg",
				"font-bold",
				"border-blue-500",
				"transition-transform",
				"transform",
				"origin-top",
				{
					"text-xl border-b-4": partyAddr === turn,
					"scale-110": partyAddr === turn,
				},
			)}
		>
			{party?.name}
		</h3>
	);
}

function SkirmishPhase() {
	const {
		params: { phase },
	} = useRouteMatch("/skirmish/:phase");

	switch (phase) {
		case "mulligan": {
			return <h2 className="text-xl text-blue-800">Mulligan</h2>;
		}

		default:
			return null;
	}
}

export default function SkirmishWrapper({ children }) {
	const parties = useGameState(R.pathOr([], ["skirmish", "parties"]));

	return (
		<React.Fragment>
			<div className="absolute inset-2 border-2 rounded border-black shadow-inner" />
			<div className="absolute inset-2 flex flex-col items-center p-2">
				<h1 className="text-xl font-bold">Skirmish</h1>
				<SkirmishPhase />
				<div className="flex">
					<PartyDisplay partyAddr={parties[0]} />
					<PartyDisplay partyAddr={parties[1]} />
				</div>

				<div className="flex-1 flex flex items-center justify-center">{children}</div>
			</div>
		</React.Fragment>
	);
}
