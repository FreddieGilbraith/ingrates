import React from "react";
import cn from "classnames";
import * as R from "ramda";

import { useGameState } from "../useGameState";
import Wrapper from "../Wrapper";

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
	const phase = useGameState(R.path(["skirmish", "phase"]));

	return (
		<h2 className="text-xl text-blue-800">
			{(() => {
				switch (phase) {
					case "main": {
						return "Main";
					}

					case "mulligan": {
						return "Mulligan";
					}

					case "init": {
						return "Begin";
					}
				}
			})()}
		</h2>
	);
}

export default function SkirmishWrapper({ children }) {
	const parties = useGameState(R.pathOr([], ["skirmish", "parties"]));

	return (
		<Wrapper title="Skirmish">
			<SkirmishPhase />
			<div className="flex">
				<PartyDisplay partyAddr={parties[0]} side="left" />
				<PartyDisplay partyAddr={parties[1]} side="right" />
			</div>

			<div className="flex-1 flex flex-col items-center justify-center">{children}</div>
		</Wrapper>
	);
}
