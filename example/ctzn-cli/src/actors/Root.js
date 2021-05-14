import SessionActor from "./Session.js";
import PromptsCLIActor from "./PromptsCLI.js";
import SocialGraphActor from "./SocialGraph.js";

export default function RootActor({ msg, self, dispatch, spawn, state = {}, log }) {
	log(msg);
	switch (msg.type) {
		case "STARTUP": {
			log("started root");
			break;
		}
	}

	return {
		...state,
		counter: state.counter + 1,
	};
}

RootActor.startup = ({ self, dispatch }) => {
	dispatch(self, { type: "STARTUP" });
	return {
		counter: 1,
	};
};
