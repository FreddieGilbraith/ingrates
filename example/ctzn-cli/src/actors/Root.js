import SessionActor from "./Session.js";
import PromptsCLIActor from "./PromptsCLI.js";

export default function* RootActor({ dispatch, spawn, state = {}, log }) {
	let statelessActors = {};
	state.session = spawn(SessionActor);

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
		}
	}
}
