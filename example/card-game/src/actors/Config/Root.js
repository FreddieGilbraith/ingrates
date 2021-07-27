import { register } from "./system";

register(Root);

export default function Root({ log, msg, dispatch }) {
	switch (msg.type) {
		case "IntroEngine": {
			log(msg);
			dispatch(msg.src, { type: "ConfirmStartup" });
			break;
		}

		default: {
			log(msg);
			break;
		}
	}
}
