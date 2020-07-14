import { createSystem, defineActor } from "../src";

describe("external resolvers", () => {
	const rootActor = defineActor(
		"root",
		(msg, { forward, friends, dispatch, parent }) => {
			switch(msg.type){
				case "INTRO": 

				case "FORWARD_TO_INTERNAL":

			}
		},
	);


