import SessionActor from "./Session.js";
import PromptsCLIActor from "./PromptsCLI.js";
import SocialGraphActor from "./SocialGraph.js";

export default function* RootActor({ self, dispatch, spawn, state = {}, log }) {
	log("Started ctzn-ingrates-browser");

	let statelessActors = {};

	//state.session ||= spawn(SessionActor);
	state.socialGraph ||= spawn(SocialGraphActor);

	dispatch(self, { type: "SESSION_HAS_STARTED", userId: "freddiegilbraith@ctzn.one" });

	while (true) {
		const msg = yield state;

		switch (msg.type) {
			case "REQUEST_PROMPTS_ADDR": {
				statelessActors.promptsCli ||= spawn(PromptsCLIActor);
				dispatch(msg.src, {
					type: "RESPOND_PROMPTS_ADDR",
					addr: statelessActors.promptsCli,
				});
				break;
			}

			case "SESSION_HAS_STARTED": {
				log("Started session as", msg.userId);
				dispatch(state.socialGraph, { type: "REPORT_FOUND_USER", userId: msg.userId });
				break;
			}

			default: {
				log(msg);
				break;
			}
		}
	}
}
