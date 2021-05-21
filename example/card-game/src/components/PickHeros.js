import React from "react";

import useActor from "./useActor";

export default function PickHeros({ skirmish, gamePlayActor }) {
	const { self, state, dispatch } = useActor(
		({
			dispatch,
			msg,
			state = { draughtableHeros: [], turn: 1, picked: { 1: [], 2: [] } },
			log,
		}) => {
			switch (msg.type) {
				case "MOUNT": {
					dispatch(skirmish, { type: "REQUEST_DRAUGHTABLE_HEROS" });
					break;
				}

				case "RESPOND_DRAUGHTABLE_HEROS": {
					return {
						...state,
						draughtableHeros: msg.heros,
					};
					break;
				}

				case "SELECT_HERO": {
					const picked = {
						...state.picked,
						[state.turn]: [...state.picked[state.turn], msg.hero],
					};

					if (picked[1].length === 2 && picked[2].length === 2) {
						dispatch(skirmish, { type: "PLAYERS_HAVE_PICKED_HEROS", picked });
						dispatch(gamePlayActor, { type: "REFRESH_VIEW" });
					}

					return {
						...state,
						picked,
						turn: state.turn === 1 ? 2 : 1,
					};
				}
			}

			return state;
		},
	);

	if (!state) {
		return null;
	}

	if (state.draughtableHeros.length > 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full">
				<div className="flex">
					<div className="h-32 w-64 flex flex-col items-center">
						<h2 className="text-4xl">Player 1</h2>
						<ul className="flex items-center flex-col">
							{state.picked[1].map((hero) => (
								<li key={hero} className="text-xl py-2">
									{hero}
								</li>
							))}
						</ul>
					</div>

					<div className="h-32 w-64 flex flex-col items-center">
						<h2 className="text-4xl">Player 2</h2>
						<ul className="flex items-center flex-col">
							{state.picked[2].map((hero) => (
								<li key={hero} className="text-xl py-2">
									{hero}
								</li>
							))}
						</ul>
					</div>
				</div>

				<h1 className="text-6xl pb-8">Player {state.turn} Pick a Hero</h1>
				<ul className="flex items-center flex-col">
					{state.draughtableHeros.map((hero) => (
						<li key={hero} className="text-xl py-2">
							<button
								className={`border rounded shadow px-4 py-2 ${
									state.picked[state.turn].includes(hero) && "opacity-50"
								}`}
								disabled={state.picked[state.turn].includes(hero)}
								onClick={dispatch.bind(null, self, { type: "SELECT_HERO", hero })}
							>
								{hero}
							</button>
						</li>
					))}
				</ul>
			</div>
		);
	}
	return <div />;
}
