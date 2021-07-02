import system from "../system";

import Player from "./Player";
import Party from "./Party";
import Character from "./Character";

system.register(Campaign);

export default function Campaign({ msg, log, children, dispatch }) {
	switch (msg.type) {
		case "TestGetSkirmishParties": {
			dispatch(msg.src, {
				type: "SetSkirmishParties",
				parties: [children.testParty1, children.testParty2],
			});
			break;
		}

		default: {
			log(msg);
			break;
		}
	}
}

Campaign.startup = ({ dispatch, parent, spawn }) => {
	dispatch(spawn.protag(Player), {
		type: "AssignParty",
		party: dispatch(spawn.testParty1(Party, "Player Party"), {
			type: "AddMembers",
			members: [
				spawn.testRanger1(Character, "Ranger"),
				spawn.testWizard1(Character, "Wizard"),
			],
		}),
	});

	dispatch(spawn.testParty2(Party, "Enemy Party"), {
		type: "AddMembers",
		members: [spawn.testRouge1(Character, "Rouge"), spawn.testWarrior1(Character, "Warrior")],
	});

	dispatch(parent, { type: "Ready" });
};
