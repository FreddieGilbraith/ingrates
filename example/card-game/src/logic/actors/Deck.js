import system from "../system";

system.register(Deck);

export default function Deck({ msg, log }) {
	switch (msg.type) {
		default: {
			log(msg);
			break;
		}
	}
}
