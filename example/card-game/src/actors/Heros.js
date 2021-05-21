import fixedId from "fixed-id";

import system from "../system";

import HeroActor from "./Hero";
import CardActor from "./Card";

system.register(HerosActor);

function generateHeroArguments(heroType, spawn) {
	switch (heroType) {
		case "ranger": {
			return [
				"Ranger",
				10,
				[
					spawn(CardActor),
					spawn(CardActor),
					spawn(CardActor),
					spawn(CardActor),
					spawn(CardActor),
				],
			];
		}

		case "rouge": {
			return [
				"Rouge",
				15,
				[
					spawn(CardActor),
					spawn(CardActor),
					spawn(CardActor),
					spawn(CardActor),
					spawn(CardActor),
				],
			];
		}
		case "warrior": {
			return [
				"Warrior",
				20,
				[
					spawn(CardActor),
					spawn(CardActor),
					spawn(CardActor),
					spawn(CardActor),
					spawn(CardActor),
				],
			];
		}
		case "wizard": {
			return [
				"Wizard",
				10,
				[
					spawn(CardActor),
					spawn(CardActor),
					spawn(CardActor),
					spawn(CardActor),
					spawn(CardActor),
				],
			];
		}
	}
}

export default function HerosActor({ spawn, children, msg, dispatch, log }) {
	switch (msg.type) {
		case "REQUEST_DRAUGHTABLE_HEROS": {
			dispatch(msg.src, {
				type: "RESPOND_DRAUGHTABLE_HEROS",
				heros: ["ranger", "rouge", "warrior", "wizard"],
			});
			break;
		}

		case "GENERATE_AND_ASSIGN_HERO": {
			const heroArguments = generateHeroArguments(msg.heroType, (...args) =>
				spawn[fixedId()](...args),
			);

			dispatch(msg.player, {
				type: "ASSIGN_HERO",
				hero: spawn[fixedId()](HeroActor, ...heroArguments),
			});
			break;
		}

		default: {
			log(msg);
		}
	}
}
