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
				"transition-all",
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

function useOnMountClassname(initial, then, time = 64) {
	const [className, setClassname] = React.useState(initial);

	React.useEffect(() => {
		const id = setTimeout(() => {
			setClassname(then);
		}, time);

		return () => clearTimeout(id);
	}, [initial, then]);

	return className;
}

export function MulliganCard({ nth, ofN, cardAddr, rejected, onClick }) {
	const rotateClassName = useOnMountClassname("rotate-0", rotateClassnameTuples[ofN - 1][nth]);
	const slowMountClassName = useOnMountClassname("duration-500", "duration-100", 1000);
	const delayMountClassName = useOnMountClassname(
		["", "delay-100", "delay-200", ...new Array(10).fill("delay-300")][nth],
		"",
		1000,
	);
	const fadeInAndUpClassName = useOnMountClassname(
		"opacity-0 translate-y-64",
		cn({
			"opacity-60 hover:opacity-80 scale-90": rejected,
			"hover:opacity-40": !rejected,
		}),
	);

	return (
		<CardFace
			cardAddr={cardAddr}
			onClick={onClick}
			className={cn(
				"m-4",
				delayMountClassName,
				rotateClassName,
				slowMountClassName,
				fadeInAndUpClassName,
			)}
		/>
	);
}

export function HandCard({ nth, ofN, cardAddr, picked, onClick }) {
	const rotateClassName = useOnMountClassname("rotate-0", rotateClassnameTuples[ofN - 1][nth]);
	const slowMountClassName = useOnMountClassname("duration-500", "duration-100", 1000);
	const fadeInAndUpClassName = useOnMountClassname("opacity-0 translate-y-64", "opacity-100");
	const delayMountClassName = useOnMountClassname(
		["", "delay-100", "delay-200", ...new Array(10).fill("delay-300")][nth],
		"",
		1000,
	);

	return (
		<CardFace
			cardAddr={cardAddr}
			onClick={onClick}
			className={cn(
				"my-4",
				"-mx-4",
				picked ? null : "hover:z-10 hover:scale-110 hover:-translate-y-8 hover:rotate-0",

				delayMountClassName,
				rotateClassName,
				slowMountClassName,
				fadeInAndUpClassName,
			)}
		/>
	);
}
