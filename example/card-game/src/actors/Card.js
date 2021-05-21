import system from "../system";

system.register(CardActor);

export default function CardActor(
	{ msg, state = { health: maxHealth } },
	name,
	maxHealth,
	providedCards,
) {}
