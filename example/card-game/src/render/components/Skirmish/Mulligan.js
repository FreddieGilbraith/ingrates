import React from "react";
import cn from "classnames";
import * as R from "ramda";

import { useGameDispatch, useGameState } from "../useGameState";
import Button from "../Button";

function MulliganCard({ cardAddr, i, rejected, onClick }) {
	const [turnClassName, setTurnClassName] = React.useState("rotate-0");

	React.useEffect(() => {
		const id = setTimeout(() => {
			if (i < 0.5) {
				return setTurnClassName("-rotate-6 translate-y-4");
			}
			if (i > 0.5) {
				return setTurnClassName("rotate-6 translate-y-4");
			}
			if (i === 0.5) {
				return setTurnClassName("rotate-0");
			}
		}, 64);

		return () => clearTimeout(id);
	}, [i]);

	const card = useGameState(R.path(["card", cardAddr]));

	return (
		<button
			onClick={onClick}
			className={cn(
				"m-4",
				"border-2",
				"border-black",
				"h-72",
				"rounded",
				"shadow",
				"transform",
				"transition-transform",
				"w-48",
				"origin-bottom",
				turnClassName,

				"flex",
				"flex-col",
				"items-stretch",
				"p-3",
				{
					"opacity-60 hover:opacity-80 scale-90": rejected,
					"hover:opacity-40": !rejected,
				},
			)}
		>
			<div className="text-center text-xl">{card.meta.cardName}</div>
			<div className="text-center text-lg">level: {card.meta.level}</div>
			{card.meta.instant ? (
				<div className="text-center text-lg text-blue-400">instant</div>
			) : null}
		</button>
	);
}

export default function Mulligan({
	match: {
		params: { partyId },
	},
}) {
	const dispatch = useGameDispatch();
	const hand = useGameState(R.pathOr([], ["skirmish", partyId, "hand"]));
	const skirmish = useGameState(R.path(["skirmish", "addr"]));
	const [rejected, setRejected] = React.useState({});

	React.useEffect( () => setRejected({}), [ partyId]);

	if (hand.length !== 3) {
		return null;
	}

	return (
		<div className="flex flex-col items-center">
			<div className="flex flex-row">
				{hand.map((cardAddr, i, { length }) => (
					<MulliganCard
						key={cardAddr}
						i={(i + 1) / (length + 1)}
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
					party: partyId,
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
