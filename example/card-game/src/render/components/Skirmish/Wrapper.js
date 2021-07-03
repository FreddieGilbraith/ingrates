import React from "react";
import cn from "classnames";
import * as R from "ramda";
import { useRouteMatch } from "react-router";

import { useGameState } from "../useGameState";

function PartyDisplay({ partyAddr, side }) {
	const party = useGameState(R.path(["party", partyAddr]));
	const turn = useGameState(R.path(["skirmish", "turn"]));
	const cardsInDeck = useGameState(R.path(["skirmish", partyAddr, "inDeck"]));

	if (!party) {
		return null;
	}

	return (
		<div
			className={cn(
				"px-2",
				"flex",
				"items-center",
				{
					"flex-row-reverse": side === "right",
					"flex-row": side === "left",
				},

				"border-blue-500",
				"transition-transform",
				"transform",
				"origin-top",
				{
					"border-b-4": partyAddr === turn,
					"scale-125": partyAddr === turn,
				},
			)}
		>
			<div>({cardsInDeck})</div>

			<h3 className={cn("px-2", "py-2", "text-lg", "font-bold")}>{party?.name}</h3>
		</div>
	);
}

function SkirmishPhase() {
	const {
		params: { phase },
	} = useRouteMatch("/skirmish/:phase");

	return (
		<h2 className="text-xl text-blue-800">
			{(() => {
				switch (phase) {
					case "mulligan": {
						return "Mulligan";
					}

					default:
						return "Begin";
				}
			})()}
		</h2>
	);
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
					<PartyDisplay partyAddr={parties[0]} side="left" />
					<PartyDisplay partyAddr={parties[1]} side="right" />
				</div>

				<div className="flex-1 flex flex items-center justify-center">{children}</div>
			</div>
		</React.Fragment>
	);
}
