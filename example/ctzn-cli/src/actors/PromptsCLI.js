import prompts from "prompts";

export default async function* PromptsCLIActor({ dispatch, self }) {
	while (true) {
		const msg = yield;

		if (msg.prompt) {
			const response = await prompts(msg.prompt);
			dispatch(msg.src, {
				...msg,
				src: self,
				response,
				type: msg.type.replace("REQUEST", "RESPOND"),
			});
		}
	}
}
