import React from "react";
import fixedId from "fixed-id";

const SystemContext = React.createContext({ system: null });

export function SystemProvider({ system, children }) {
	return <SystemContext.Provider value={{ system }}>{children}</SystemContext.Provider>;
}

export default function createUseActor(actor) {
	return function useActor() {
		const { system } = React.useContext(SystemContext);

		const [actorStuff] = React.useState(() => {
			system.register(actor);
			const self = system.spawn[fixedId()](actor);
			return { self };
		});

		return actorStuff;
	};
}
