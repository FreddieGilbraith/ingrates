import system from "../system";

system.register(Hand);

export default function Hand({ msg, log }) {
	switch (msg.type) {
		default: {
			log(msg);
			break;
		}
	}
}
