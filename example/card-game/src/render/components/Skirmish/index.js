import React from "react";
import cn from "classnames";
import * as R from "ramda";
import { Route } from "react-router";

import { useGameDispatch, useGameState } from "../useGameState";

import Wrapper from "./Wrapper";
import Start from "./Start";
import Mulligan from "./Mulligan";

export default function Skirmish() {
	return (
		<Wrapper>
			<Route path="/skirmish/start" component={Start} />
			<Route path="/skirmish/mulligan/:partyId" component={Mulligan} />
		</Wrapper>
	);
}
