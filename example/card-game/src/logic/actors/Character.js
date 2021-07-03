import fixedId from "fixed-id";
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

export default function Character({ children, state, dispatch, msg, log }, characterClass) {
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
					spawn[`card${fixedId()}`](CardDefinitions.BrutalSmash),
					spawn[`card${fixedId()}`](CardDefinitions.SuperiorStrategist),
					spawn[`card${fixedId()}`](CardDefinitions.SuperiorStrategist),
					spawn[`card${fixedId()}`](CardDefinitions.Block),
					spawn[`card${fixedId()}`](CardDefinitions.Block),
					spawn[`card${fixedId()}`](CardDefinitions.Block),
					spawn[`card${fixedId()}`](CardDefinitions.Slash),
					spawn[`card${fixedId()}`](CardDefinitions.Slash),
					spawn[`card${fixedId()}`](CardDefinitions.Slash),
					spawn[`card${fixedId()}`](CardDefinitions.Slash),
				],
			};
		}

		case "Rouge": {
			return {
				cardPool: [
					spawn[`card${fixedId()}`](CardDefinitions.Dissarray),
					spawn[`card${fixedId()}`](CardDefinitions.SlightOfHand),
					spawn[`card${fixedId()}`](CardDefinitions.SlightOfHand),
					spawn[`card${fixedId()}`](CardDefinitions.LookBehindYou),
					spawn[`card${fixedId()}`](CardDefinitions.LookBehindYou),
					spawn[`card${fixedId()}`](CardDefinitions.LookBehindYou),
					spawn[`card${fixedId()}`](CardDefinitions.TripWire),
					spawn[`card${fixedId()}`](CardDefinitions.TripWire),
					spawn[`card${fixedId()}`](CardDefinitions.TripWire),
					spawn[`card${fixedId()}`](CardDefinitions.Soobataag),
					spawn[`card${fixedId()}`](CardDefinitions.Soobataag),
					spawn[`card${fixedId()}`](CardDefinitions.Soobataag),
					spawn[`card${fixedId()}`](CardDefinitions.ThrownKnife),
					spawn[`card${fixedId()}`](CardDefinitions.ThrownKnife),
					spawn[`card${fixedId()}`](CardDefinitions.ThrownKnife),
					spawn[`card${fixedId()}`](CardDefinitions.ThrownKnife),
				],
			};
		}

		case "Wizard": {
			return {
				cardPool: [
					spawn[`card${fixedId()}`](CardDefinitions.Imolate),
					spawn[`card${fixedId()}`](CardDefinitions.Heal),
					spawn[`card${fixedId()}`](CardDefinitions.Heal),
					spawn[`card${fixedId()}`](CardDefinitions.ScryingTrance),
					spawn[`card${fixedId()}`](CardDefinitions.ScryingTrance),
					spawn[`card${fixedId()}`](CardDefinitions.TimeWizard),
					spawn[`card${fixedId()}`](CardDefinitions.TimeWizard),
					spawn[`card${fixedId()}`](CardDefinitions.TimeWizard),
					spawn[`card${fixedId()}`](CardDefinitions.SummoningCircle),
					spawn[`card${fixedId()}`](CardDefinitions.SummoningCircle),
					spawn[`card${fixedId()}`](CardDefinitions.SummoningCircle),
					spawn[`card${fixedId()}`](CardDefinitions.MissileOfMagic),
					spawn[`card${fixedId()}`](CardDefinitions.MissileOfMagic),
					spawn[`card${fixedId()}`](CardDefinitions.MissileOfMagic),
					spawn[`card${fixedId()}`](CardDefinitions.MissileOfMagic),
				],
			};
		}

		case "Ranger": {
			return {
				cardPool: new Array(10)
					.fill(null)
					.map(() => spawn[`card${fixedId()}`](CardDefinitions.Longbow)),
			};
		}

		default: {
			log("unhandled class", characterClass);
			return { cards: [] };
		}
	}
};
