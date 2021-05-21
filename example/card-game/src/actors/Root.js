import system from "../system";

import RendererActor from "./Renderer";
import SessionActor from "./Session";

system.register(RootActor);

export default function RootActor({ aquire, msg, dispatch, children, log }) {
	switch (msg.type) {
		case "RENDERER_HAS_STARTED": {
			const session = aquire.session(SessionActor);
			log({ session });
			break;
		}

		default: {
			log(msg);
			break;
		}
	}
}

RootActor.startup = ({ dispatch, spawn }) => {
	dispatch(spawn.renderer(RendererActor), { type: "STARTUP" });
};
