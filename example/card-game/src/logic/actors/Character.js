import system from "../system";

import "./CardDefinition";

system.register(Character);

export default function Character({ spawn, dispatch, msg, log }, characterClass) {
	switch (msg.type) {
		case "RequestCardDefinitions": {
			switch (characterClass) {
				case "Warrior": {
					dispatch(msg.src, {
						type: "RespondCardDefinitions",
						cardDefinitions: [
							//spawn.card0(BrutalSmash),
							//spawn.card1(SuperiorStrategist),
							//spawn.card2(SuperiorStrategist),
							//spawn.card3(Block),
							//spawn.card4(Block),
							//spawn.card5(Block),
							//spawn.card6(Slash),
							//spawn.card7(Slash),
							//spawn.card8(Slash),
							//spawn.card7(Slash),
						],
					});
					break;
				}

				default: {
					log("unhandled class", characterClass);
					break;
				}
			}
			break;
		}
		default: {
			log(msg);
			break;
		}
	}
}
