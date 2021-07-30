import { register } from "./system";

register(Root);

export default function Root({ log, msg, dispatch }) {
	switch (msg.type) {
		case "IntroEngine": {
			dispatch(msg.src, { type: "ConfirmStartup" });
			break;
		}

		default: {
			if(msg.type !== "Start" && msg.type !== "Mount") log(msg);
			break;
		}
	}
}
