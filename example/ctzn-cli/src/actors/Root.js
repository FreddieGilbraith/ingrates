import system from "../system.js";

import SessionActor from "./Session.js";
import PromptsCLIActor from "./PromptsCLI.js";
import SocialGraphActor from "./SocialGraph.js";

system.register(RootActor);
export default function RootActor({
	aquire,
	children,
	msg,
	self,
	dispatch,
	spawn,
	state = {},
	log,
}) {
	switch (msg.type) {
		case "STARTUP": {
			const addr = aquire.session(SessionActor);
			log({ addr });
			break;
		}
		default: {
			log(msg);
		}
	}

	return {
		...state,
		counter: state.counter + 1,
	};
}

RootActor.startup = () => {
	return {
		counter: 1,
	};
};
