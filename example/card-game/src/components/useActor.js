import React from "react";
import fixedId from "fixed-id";

import system from "../system";

system.register(ReactHookActor);

function ReactHookActor(provisions, handler, exposeState) {
	const state = handler(provisions);
	exposeState(state);
	return state;
}

ReactHookActor.startup = (provisions, handler, exposeState, exposeDispatch) => {
	exposeDispatch({ dispatch: provisions.dispatch });

	if (handler.startup) {
		const state = handler.startup(provisions);
		exposeState(state);
		return state;
	}
};

export default function useActor(actorFn) {
	const [state, setState] = React.useState();
	const [{ dispatch }, setDispatch] = React.useState({});

	const [self] = React.useState(() => {
		const addr = system.spawn[`useActor(${fixedId()})`](
			ReactHookActor,
			actorFn,
			setState,
			setDispatch,
		);
		system.dispatch(addr, { type: "MOUNT" });
		return addr;
	});

	return { self, state, dispatch };
}
