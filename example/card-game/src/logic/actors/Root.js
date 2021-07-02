import system from "../system";

import RendererActor from "./Renderer";
import SessionActor from "./Session";

system.register(RootActor);

export default function RootActor({ aquire, msg, dispatch, children, log }) {
	switch (msg.type) {
		case "RENDERER_HAS_STARTED": {
			dispatch(msg.src, { type: "INTRO_SESSION", session: children.session });
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
	spawn.session(SessionActor);
};
