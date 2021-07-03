import React from "react";
import { Route } from "react-router";

import Wrapper from "./Wrapper";
import Start from "./Start";
import Mulligan from "./Mulligan";

export default function Skirmish() {
	return (
		<Wrapper>
			<Route path="/skirmish/start" component={Start} />
			<Route path="/skirmish/mulligan" component={Mulligan} />
		</Wrapper>
	);
}
