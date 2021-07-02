import fixedId from "fixed-id";

import system from "../../system";

system.register(HeroActor);

function ranger({ msg }) {}
function rouge({ msg }) {}
function warrior({ msg }) {}
function wizard({ msg }) {}

const heroHandlers = {
	ranger,
	rouge,
	warrior,
	wizard,
};

export default function HeroActor(provisions, heroType) {
	return heroHandlers[heroType](provisions);
}
