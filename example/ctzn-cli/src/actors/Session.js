export default async function* SessionActor({ parent, dispatch, state = {}, query, log }) {
	state.promptsCli = (await query("root", { type: "REQUEST_PROMPTS_ADDR" })).addr;

	if (!state.sessionId) {
		dispatch(state.promptsCli, {
			type: "REQUEST_LOGIN_DETAILS",
			prompt: [
				{ type: "text", name: "homeserver", message: "What's your home server?" },
				{ type: "text", name: "username", message: "What's your username?" },
				{ type: "password", name: "password", message: "What's your password?" },
			],
		});
	}

	while (true) {
		const msg = yield;
		log(msg);

		switch (msg.type) {
			case "RESPOND_LOGIN_DETAILS": {
				const {
					response: { homeserver, username, password },
				} = msg;
				dispatch(`ctzn://${homeserver}`, {
					type: "REQUEST_LOGIN",
					method: "accounts.login",
					params: [{ username, password }],
				});
				break;
			}
		}
	}
}
