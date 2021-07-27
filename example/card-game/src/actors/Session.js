import system from "../system";

import Skirmish from "./Skirmish";

system.register(Session);

export default async function Session({ query, spawn, log, msg, state }) {
	switch (msg.type) {
		case "BeginSkirmish": {
			if (state.skirmishInProgress) {
				break;
			}

			const { parties } = await query(msg.campaign, { type: "TestGetSkirmishParties" });

			spawn.skirmish(Skirmish, parties);

			return {
				campaign: msg.campaign,
				skirmishInProgress: true,
			};
		}

		default: {
			log(msg);
			break;
		}
	}

	return state;
}

Session.startup = ({ dispatch, parent }) => {
	dispatch(parent, { type: "Ready" });

	return {
		skirmishInProgress: false,
	};
};
