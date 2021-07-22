import React from "react";
import * as R from "ramda";

import Button from "../Button";
import { useGameDispatch, useGameState } from "../useGameState";

export default function SkirmishStart() {
	const engineAddr = useGameState(R.path(["engine", "addr"]));
	const dispatch = useGameDispatch();

	return (
		<div>
			<Button
				move="up"
				color="green"
				onClick={dispatch.bind(null, engineAddr, { type: "CreateSkirmish" })}
			>
				Begin
			</Button>
		</div>
	);
}
