import UsersListActor from "./UsersList.js";

export default function* SocialGraphActor({ dispatch, spawn, log, state = {} }) {
	state.usersList ||= spawn(UsersListActor);

	while (true) {
		const msg = yield state;
		switch (msg.type) {
			case "REPORT_FOUND_USER": {
				dispatch(state.usersList, msg);
				break;
			}

			case "REPORT_FOUND_COMMUNITY": {
				dispatch(state.communitiesList, msg);
				break;
			}
		}
	}
}
