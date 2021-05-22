function createCardActor(cardName, cardLevel, isInstant) {
	function CardActor({ msg, dispatch, state, log }, player) {
		switch (msg.type) {
			case "REQUEST_CARD_DETAILS": {
				dispatch(msg.src, { type: "RESPOND_CARD_DETAILS", cardName, cardLevel, isInstant });
				break;
			}

			case "REQUEST_CARD_NAME": {
				dispatch(msg.src, { type: "RESPOND_CARD_NAME", cardName });
				break;
			}

			case "REQUEST_CARD_LEVEL": {
				dispatch(msg.src, { type: "RESPOND_CARD_LEVEL", cardLevel });
				break;
			}

			case "REQUEST_CARD_IS_INSTANT": {
				dispatch(msg.src, { type: "RESPOND_CARD_IS_INSTANT", isInstant });
				break;
			}

			default: {
				log(cardName, msg);
				break;
			}
		}
		return state;
	}
}

//Deal <PPP play={1} place={2} prepare={3} /> damage for every concious hero
export const BrutalSmashCardActor = createCardActor("Brutal Smash", 4, false);

//Draw 2 cards
export const SuperiorStrategistCardActor = createCardActor("Superior Strategist", 3, true);

//Add <PPP play={1} place={2} prepare={3} /> life counters to one of your heros untill the start of your next turn.
export const BlockCardActor = createCardActor("Block", 2, false);

//Deal <PPP play={2} place={3} prepare={4} /> damage
export const SlashCardActor = createCardActor("Brutal Smash", 1, false);

export const defaultWarriorDeck = [
	...new Array(1).fill(BrutalSmashCardActor),
	...new Array(2).fill(SuperiorStrategistCardActor),
	...new Array(3).fill(BlockCardActor),
	...new Array(4).fill(SlashCardActor),
];

//<Card level={4} count={1} title="Dissarray">
//Your opponent must shuffle all but{" "}
//<PPP play={4} place={3} prepare={2} /> of their cards from their hand
//and side of the board. They then draw{" "}
//<PPP play={6} place={5} prepare={4} /> Cards.
//</Card>

//<Card level={3} count={2} title="Slight of Hand">
//<Keyword>Prepare</Keyword> this card. if your opponent destroys it
//before it is <Keyword>Played</Keyword> destroy one of their{" "}
//<Keyword>Heros</Keyword>, othewise your <Keyword>Rouge</Keyword> looses{" "}
//<Keyword>1 life token</Keyword>.
//</Card>

//<Card level={3} count={2} title="Slight of Hand">
//Look at the top <PPP play={2} place={4} prepare={6} /> cards in your
//deck, choose <PPP play={1} place={2} prepare={3} /> and add them to your
//hand.
//</Card>

//<Card level={2} count={3} title='"Look Behind You..."'>
//When this card changes from <Keyword>Prepared</Keyword> to{" "}
//<Keyword>Placed</Keyword>, immediately<Keyword> Play</Keyword> all other
//cards on your side of the board
//</Card>

//<Card level={2} count={3} title="Trip Wire" instant>
//Move one of your opponent's cards from <Keyword>Placed</Keyword> to{" "}
//<Keyword>Prepared</Keyword>
//</Card>

//<Card level={2} count={3} title="Soobataag" instant>
//Destroy one of the cards on your opponent's side of the board, if that
//card was <Keyword>Prepared</Keyword>, destroy another{" "}
//</Card>

//<Card level={1} count={4} title="Thrown Knife">
//Deal <PPP play={1} place={2} prepare={3} /> damage
//</Card>
