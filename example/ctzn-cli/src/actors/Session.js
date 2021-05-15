import system from "../system.js";

system.register(SessionActor);

export default async function SessionActor({ parent, dispatch, state = {}, query, log }) {
	function requestLoginFromUser() {
		//dispatch(promptsCli, {
		//type: "REQUEST_LOGIN_DETAILS",
		//prompt: [
		//{ type: "text", name: "homeserver", message: "What's your home server?" },
		//{ type: "text", name: "username", message: "What's your username?" },
		//{ type: "password", name: "password", message: "What's your password?" },
		//],
		//});
	}
}
