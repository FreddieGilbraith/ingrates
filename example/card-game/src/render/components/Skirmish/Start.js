import React from "react";
import * as R from "ramda";

import Button from "../Button";
import { useGameDispatch, useGameState } from "../useGameState";

export default function SkirmishStart() {
	const skirmishAddr = useGameState(R.path(["skirmish", "addr"]));
	const dispatch = useGameDispatch();

	return (
		<div>
			<Button
			move="up"
				color="green"
				onClick={dispatch.bind(null, skirmishAddr, { type: "StartMulliganPhase" })}
			>
				Begin
			</Button>
		</div>
	);
}
