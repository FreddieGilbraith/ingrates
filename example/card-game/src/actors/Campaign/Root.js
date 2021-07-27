import { register } from "./system";

register(Root);

export default function Root({ msg, log }) {
	switch (msg.type) {
		default: {
			log(msg);
			break;
		}
	}
}

