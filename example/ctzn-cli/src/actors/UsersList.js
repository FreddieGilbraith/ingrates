import UserActor from "./User.js";

function getRandomFromArray(xs) {
	return xs[Math.floor(Math.random() * xs.length)];
}

export default async function* UsersListActor({ parent, self, dispatch, spawn, state = {}, log }) {
	dispatch(self, { type: "REFRESH_RANDOM_USER" });
	dispatch(self, { type: "KILL_RANDOM_USER" });

	while (true) {
		const msg = yield state;

		switch (msg.type) {
			case "REFRESH_RANDOM_USER": {
				const addr = getRandomFromArray(Object.values(state));
				if (addr) {
					dispatch(addr, { type: "REFRESH" });
				}
				const refreshTimeout = 1e4;
				setTimeout(dispatch, refreshTimeout, self, { type: "REFRESH_RANDOM_USER" });
				break;
			}

			case "KILL_RANDOM_USER": {
				const addr = getRandomFromArray(Object.values(state));
				if (addr) {
					dispatch(addr, { type: "DIE" });
					delete state[addr];
				}
				const killTimeout = 3e5;
				setTimeout(dispatch, killTimeout, self, { type: "KILL_RANDOM_USER" });
				break;
			}

			case "REPORT_FOUND_USER": {
				if (!state[msg.userId]) {
					log("found", msg.userId);
					state[msg.userId] = spawn(UserActor, msg.userId);
				}
				break;
			}
			case "REPORT_FOUND_COMMUNITY": {
				dispatch(parent, msg);
				break;
			}
		}
	}
}
