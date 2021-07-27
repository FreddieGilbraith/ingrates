import system from "../../system";

function genericCardHandler(cardName, level, isInstant, { self, msg, log, dispatch }) {
	switch (msg.type) {
		case "InformRenderer": {
			dispatch("render", {
				path: ["card", self, "meta"],
				value: { cardName, level, isInstant },
			});
			break;
		}
		default: {
			log(msg);
			break;
		}
	}
}

//Deal <PPP play={1} place={2} prepare={3} /> damage for every concious hero
system.register(BrutalSmash);
export function BrutalSmash(x) {
	return genericCardHandler("Brutal Smash", 4, false, x);
}

////Draw 2 cards
system.register(SuperiorStrategist);
export function SuperiorStrategist(x) {
	return genericCardHandler("Superior Strategist", 3, true, x);
}

//Add <PPP play={1} place={2} prepare={3} /> life counters to one of your heros untill the start of your next turn.
system.register(Block);
export function Block(x) {
	return genericCardHandler("Block", 2, false, x);
}

//Deal <PPP play={2} place={3} prepare={4} /> damage
system.register(Slash);
export function Slash(x) {
	return genericCardHandler("Slash", 1, false, x);
}

//Your opponent must shuffle all but{" "}
//<PPP play={4} place={3} prepare={2} /> of their cards from their hand
//and side of the board. They then draw{" "}
//<PPP play={6} place={5} prepare={4} /> Cards.
system.register(Dissarray);
export function Dissarray(x) {
	return genericCardHandler("Dissarray", 4, false, x);
}

//<Keyword>Prepare</Keyword> this card. if your opponent destroys it
//before it is <Keyword>Played</Keyword> destroy one of their{" "}
//<Keyword>Heros</Keyword>, othewise your <Keyword>Rouge</Keyword> looses{" "}
//<Keyword>1 life token</Keyword>.
system.register(SlightOfHand);
export function SlightOfHand(x) {
	return genericCardHandler("Slight of Hand", 3, false, x);
}

//When this card changes from <Keyword>Prepared</Keyword> to{" "}
//<Keyword>Placed</Keyword>, immediately<Keyword> Play</Keyword> all other
//cards on your side of the board
system.register(LookBehindYou);
export function LookBehindYou(x) {
	return genericCardHandler("Look Behind You", 2, false, x);
}

//Move one of your opponent's cards from <Keyword>Placed</Keyword> to{" "}
//<Keyword>Prepared</Keyword>
system.register(TripWire);
export function TripWire(x) {
	return genericCardHandler("Trip Wire", 2, true, x);
}

//Destroy one of the cards on your opponent's side of the board, if that
//card was <Keyword>Prepared</Keyword>, destroy another{" "}
system.register(Soobataag);
export function Soobataag(x) {
	return genericCardHandler("Soobataag", 2, true, x);
}

//Deal <PPP play={1} place={2} prepare={3} /> damage
system.register(ThrownKnife);
export function ThrownKnife(x) {
	return genericCardHandler("Thrown Knife", 1, true, x);
}

// Destroy <PPP play={2} place={3} prepare={5} /> cards on your opponent's
// side of the board
system.register(Imolate);
export function Imolate(x) {
	return genericCardHandler("Imolate", 4, false, x);
}

// Permenantly add <PPP play={1} place={2} prepare={3} /> life counters to
// one concious hero.
system.register(Heal);
export function Heal(x) {
	return genericCardHandler("Heal", 3, false, x);
}

// Your opponent must show you <PPP play={1} place={2} prepare={3} />{" "}
// random cards from their hand.
system.register(ScryingTrance);
export function ScryingTrance(x) {
	return genericCardHandler("Scrying Trance", 3, false, x);
}

// Transition a <Keyword>Prepared</Keyword> to <Keyword>Placed</Keyword>,
// or a <Keyword>Placed</Keyword> to <Keyword>Playing</Keyword>, but retain
// the power of it's previous state.
system.register(TimeWizard);
export function TimeWizard(x) {
	return genericCardHandler("Time Wizard", 2, false, x);
}

// Draw <PPP play={1} place={2} prepare={3} /> cards.
system.register(SummoningCircle);
export function SummoningCircle(x) {
	return genericCardHandler("Summoning Circle", 2, false, x);
}

// Deal <PPP play={1} place={2} prepare={3} /> damage
system.register(MissileOfMagic);
export function MissileOfMagic(x) {
	return genericCardHandler("Missile of Magic", 1, false, x);
}

// Deal <PPP play={1} place={2} prepare={3} /> damage
system.register(Longbow);
export function Longbow(x) {
	return genericCardHandler("Longbow", 1, true, x);
}

