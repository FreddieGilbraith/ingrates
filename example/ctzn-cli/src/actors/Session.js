export default async function* SessionActor({ parent, dispatch, state = {}, query, log }) {
	function requestLoginFromUser() {
		dispatch(promptsCli, {
			type: "REQUEST_LOGIN_DETAILS",
			prompt: [
				{ type: "text", name: "homeserver", message: "What's your home server?" },
				{ type: "text", name: "username", message: "What's your username?" },
				{ type: "password", name: "password", message: "What's your password?" },
			],
		});
	}

	log("boot", state);

	let promptsCli = (await query("root", { type: "REQUEST_PROMPTS_ADDR" })).addr;

	if (state.sessionId && state.homeserver) {
		dispatch(`ctzn://${state.homeserver}`, {
			type: "REQUEST_SESSION_START",
			method: "accounts.resumeSession",
			params: [state.sessionId],
		});
	} else {
		requestLoginFromUser();
	}

	while (true) {
		const msg = yield state;

		switch (msg.type) {
			case "RESPOND_LOGIN_DETAILS": {
				const {
					response: { homeserver, username, password },
				} = msg;

				state.homeserver = homeserver;

				dispatch(`ctzn://${homeserver}`, {
					type: "REQUEST_SESSION_START",
					method: "accounts.login",
					params: [{ username, password }],
				});
				break;
			}

			case "RESPOND_SESSION_START": {
				log(msg);
				if (msg.error) {
					log(
						`There was an error starting your session, please try again (${msg.error.message}, ${msg.error.data})`,
					);
					requestLoginFromUser();
					break;
				}

				const {
					result: { sessionId, userId },
				} = msg;

				state.sessionId = sessionId;

				dispatch(parent, {
					type: "SESSION_HAS_STARTED",
					userId,
				});
			}
		}
	}
}
