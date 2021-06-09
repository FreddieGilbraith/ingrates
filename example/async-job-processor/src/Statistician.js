export default function Statistician({ msg, state = {} }) {
	switch (msg.type) {
		case "INTRO_SOURCE": {
			return {
				...state,
				source: msg.source,
			};
		}

		default: {
			console.log("Statistician", msg);
		}
	}
}
