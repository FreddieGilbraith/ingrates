import React from "react";
import cn from "classnames";
import * as R from "ramda";
import { Route } from "react-router";

import { useGameDispatch, useGameState } from "../useGameState";

export default function SkirmishStart() {
	const skirmishAddr = useGameState(R.path(["skirmish", "addr"]));
	const dispatch = useGameDispatch();

	return (
		<div>
			<button
				className={cn(
					"bg-green-700",
					"bold",
					"px-6",
					"py-3",
					"rounded",
					"shadow",
					"text-3xl",
					"text-white",

					"transition-all",
					"transform",

					"border-2",
					"border-green-800",

					"hover:-translate-y-1",
					"hover:bg-green-600",
					"hover:text-green-100",
					"hover:border-green-500",
					"hover:shadow-2xl",
				)}
				onClick={dispatch.bind(null, skirmishAddr, { type: "StartMulliganPhase" })}
			>
				Begin
			</button>
		</div>
	);
}
