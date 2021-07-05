import React from "react";
import cn from "classnames";
import * as R from "ramda";

import { useGameState } from "../useGameState";

export function CardFace({ cardAddr, className, ...props }) {
	const card = useGameState(R.path(["card", cardAddr]));

	return (
		<button
			{...props}
			className={cn(
				"border-2",
				"border-black",
				"h-72",
				"w-48",
				"rounded",
				"shadow",
				"transform",
				"transition-transform",
				"origin-bottom",
				"hover:shadow-xl",
				"bg-white",
				"flex",
				"flex-col",
				"items-stretch",
				"p-3",

				className,
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

const rotateClassnameTuples = [
	["rotate-0"],
	["-rotate-6 translate-y-4", "translate-y-4 rotate-6"],
	["translate-y-4 -rotate-6", "rotate-0", "translate-y-4 rotate-6"],
	["translate-y-4 -rotate-6", "-rotate-3", "rotate-3", "translate-y-4 rotate-6"],
	[
		"translate-y-6 -rotate-12",
		"translate-y-4 -rotate-6",
		"rotate-0",
		"translate-y-4 rotate-6",
		"translate-y-6 rotate-12",
	],
];

function useRotateClassName(nth, ofN) {
	const [rotateClassName, setRotateClassName] = React.useState("rotate-0");
	React.useEffect(() => {
		const id = setTimeout(() => {
			setRotateClassName(rotateClassnameTuples[ofN - 1][nth]);
		}, 64);

		return () => clearTimeout(id);
	}, [nth, ofN]);

	return rotateClassName;
}

export function RotatedArcCard({ nth, ofN, className, ...props }) {
	const rotateClassName = useRotateClassName(nth, ofN);
	console.log({ rotateClassName });

	return <CardFace {...props} className={cn(className, rotateClassName)} />;
}

export function MulliganCard({ nth, ofN, cardAddr, rejected, onClick }) {
	return (
		<RotatedArcCard
			nth={nth}
			ofN={ofN}
			cardAddr={cardAddr}
			onClick={onClick}
			className={cn("m-4", {
				"opacity-60 hover:opacity-80 scale-90": rejected,
				"hover:opacity-40": !rejected,
			})}
		/>
	);
}

export function HandCard({ nth, ofN, cardAddr, picked, onClick }) {
	return (
		<RotatedArcCard
			nth={nth}
			ofN={ofN}
			cardAddr={cardAddr}
			onClick={onClick}
			className={cn(
				"my-4",
				"-mx-4",
				picked ? null : "hover:z-10 hover:scale-110 hover:-translate-y-8 hover:rotate-0",
			)}
		/>
	);
}
