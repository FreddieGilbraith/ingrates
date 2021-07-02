import React from "react";

import useActor from "./useActor";

export default function BuildStartingHand({ gamePlayActor, skirmish }) {
	const { self, state, dispatch } = useActor(({ msg, state = { turn: 1 }, dispatch }) => {
		switch (msg.type) {
			case "MOUNT": {
				dispatch(skirmish, { type: "REQUEST_PLAYERS" });
				break;
			}

			case "RESPOND_PLAYERS": {
				const { player1, player2 } = msg;
				dispatch(player1, { type: "REQUEST_MULIGAN_SELECTION" });
				dispatch(player2, { type: "REQUEST_MULIGAN_SELECTION" });

				return {
					...state,
					player1,
					player2,
				};
			}
		}
		return state;
	});

	if (!state) {
		return null;
	}

	return (
		<div className="flex flex-col items-center justify-center h-full">
			<div className="flex">
				<div className="h-32 w-64 flex flex-col items-center">
					<h2 className="text-4xl">Player 1</h2>
					<ul className="flex items-center flex-col"></ul>
				</div>

				<div className="h-32 w-64 flex flex-col items-center">
					<h2 className="text-4xl">Player 2</h2>
					<ul className="flex items-center flex-col"></ul>
				</div>
			</div>

			<h1 className="text-6xl pb-8">Player {state.turn}, Mulligan Your Starting Hand</h1>
		</div>
	);
}
