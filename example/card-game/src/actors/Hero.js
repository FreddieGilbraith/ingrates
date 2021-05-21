import system from "../system";

system.register(HeroActor);

export default function HeroActor(
	{ msg, state = { health: maxHealth } },
	name,
	maxHealth,
	providedCards,
) {}
