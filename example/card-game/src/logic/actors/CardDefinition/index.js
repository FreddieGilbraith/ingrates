import system from "../../system";

function genericCardHandler(cardName, level, isInstant, { msg, log }) {
	switch (msg.type) {
		default: {
			log(msg);
			break;
		}
	}
}

//Deal <PPP play={1} place={2} prepare={3} /> damage for every concious hero
export default function BrutalSmash(x) {
	return genericCardHandler("Brutal Smash", 4, false, x);
}
system.register(BrutalSmash);
console.log({ BrutalSmash });

////Draw 2 cards
//export function SuperiorStrategist(x) {
//return genericCardHandler("Superior Strategist", 3, true, x);
//}

////Add <PPP play={1} place={2} prepare={3} /> life counters to one of your heros untill the start of your next turn.
//export function Block(x) {
//return genericCardHandler("Block", 2, false, x);
//}

////Deal <PPP play={2} place={3} prepare={4} /> damage
//export function Slash(x) {
//return genericCardHandler("Brutal Smash", 1, false, x);
//}

////<Card level={4} count={1} title="Dissarray">
////Your opponent must shuffle all but{" "}
////<PPP play={4} place={3} prepare={2} /> of their cards from their hand
////and side of the board. They then draw{" "}
////<PPP play={6} place={5} prepare={4} /> Cards.
////</Card>
//export function Dissarray(x) {
//return genericCardHandler("Dissarray", 4, false, x);
//}

////<Card level={3} count={2} title="Slight of Hand">
////<Keyword>Prepare</Keyword> this card. if your opponent destroys it
////before it is <Keyword>Played</Keyword> destroy one of their{" "}
////<Keyword>Heros</Keyword>, othewise your <Keyword>Rouge</Keyword> looses{" "}
////<Keyword>1 life token</Keyword>.
////</Card>
//export function SlightOfHand(x) {
//return genericCardHandler("Slight of Hand", 3, x);
//}

////<Card level={2} count={3} title='"Look Behind You..."'>
////When this card changes from <Keyword>Prepared</Keyword> to{" "}
////<Keyword>Placed</Keyword>, immediately<Keyword> Play</Keyword> all other
////cards on your side of the board
////</Card>
//export function LookBehindYou(x) {
//return genericCardHandler("Look Behind You", 2, false, x);
//}

////<Card level={2} count={3} title="Trip Wire" instant>
////Move one of your opponent's cards from <Keyword>Placed</Keyword> to{" "}
////<Keyword>Prepared</Keyword>
////</Card>
//export function TripWire(x) {
//return genericCardHandler("Trip Wire", 2, true, x);
//}

////<Card level={2} count={3} title="Soobataag" instant>
////Destroy one of the cards on your opponent's side of the board, if that
////card was <Keyword>Prepared</Keyword>, destroy another{" "}
////</Card>
//export function Soobataag(x) {
//return genericCardHandler("Soobataag", 2, true, x);
//}

////<Card level={1} count={4} title="Thrown Knife">
////Deal <PPP play={1} place={2} prepare={3} /> damage
////</Card>
//export function ThrownKnife(x) {
//return genericCardHandler("Thrown Knife", 1, true, x);
//}
