import system from "../system";

import * as CardDefinitions from "./CardDefinition";

system.register(Character);

function getRandom(arr, n) {
	var result = new Array(n),
		len = arr.length,
		taken = new Array(len);
	if (n > len) throw new RangeError("getRandom: more elements taken than available");
	while (n--) {
		var x = Math.floor(Math.random() * len);
		result[n] = arr[x in taken ? taken[x] : x];
		taken[x] = --len in taken ? taken[len] : len;
	}
	return result;
}

export default function Character({ state, dispatch, msg, log }) {
	switch (msg.type) {
		case "RequestCardsToBuildSkirmishDeck": {
			dispatch(msg.src, {
				type: "InsertCardsIntoDeck",
				cards: getRandom(state.cardPool, 10),
			});
			break;
		}
		default: {
			log(msg);
			break;
		}
	}
}

Character.startup = ({ log, spawn }, characterClass) => {
	switch (characterClass) {
		case "Warrior": {
			return {
				cardPool: [
					spawn(CardDefinitions.BrutalSmash),
					spawn(CardDefinitions.SuperiorStrategist),
					spawn(CardDefinitions.SuperiorStrategist),
					spawn(CardDefinitions.Block),
					spawn(CardDefinitions.Block),
					spawn(CardDefinitions.Block),
					spawn(CardDefinitions.Slash),
					spawn(CardDefinitions.Slash),
					spawn(CardDefinitions.Slash),
					spawn(CardDefinitions.Slash),
				],
			};
		}

		case "Rouge": {
			return {
				cardPool: [
					spawn(CardDefinitions.Dissarray),
					spawn(CardDefinitions.SlightOfHand),
					spawn(CardDefinitions.SlightOfHand),
					spawn(CardDefinitions.LookBehindYou),
					spawn(CardDefinitions.LookBehindYou),
					spawn(CardDefinitions.LookBehindYou),
					spawn(CardDefinitions.TripWire),
					spawn(CardDefinitions.TripWire),
					spawn(CardDefinitions.TripWire),
					spawn(CardDefinitions.Soobataag),
					spawn(CardDefinitions.Soobataag),
					spawn(CardDefinitions.Soobataag),
					spawn(CardDefinitions.ThrownKnife),
					spawn(CardDefinitions.ThrownKnife),
					spawn(CardDefinitions.ThrownKnife),
					spawn(CardDefinitions.ThrownKnife),
				],
			};
		}

		case "Wizard": {
			return {
				cardPool: [
					spawn(CardDefinitions.Imolate),
					spawn(CardDefinitions.Heal),
					spawn(CardDefinitions.Heal),
					spawn(CardDefinitions.ScryingTrance),
					spawn(CardDefinitions.ScryingTrance),
					spawn(CardDefinitions.TimeWizard),
					spawn(CardDefinitions.TimeWizard),
					spawn(CardDefinitions.TimeWizard),
					spawn(CardDefinitions.SummoningCircle),
					spawn(CardDefinitions.SummoningCircle),
					spawn(CardDefinitions.SummoningCircle),
					spawn(CardDefinitions.MissileOfMagic),
					spawn(CardDefinitions.MissileOfMagic),
					spawn(CardDefinitions.MissileOfMagic),
					spawn(CardDefinitions.MissileOfMagic),
				],
			};
		}

		case "Ranger": {
			return {
				cardPool: new Array(10).fill(null).map(() => spawn(CardDefinitions.Longbow)),
			};
		}

		default: {
			log("unhandled class", characterClass);
			return { cards: [] };
		}
	}
};
