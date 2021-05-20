import system from "../system";

import RendererActor from "./Renderer";
import SessionActor from "./Session";

system.register(RootActor);

export default function RootActor({ msg, dispatch, children }) {
	switch (msg.type) {
		case "REQUEST_RENDERER_ADDR": {
			dispatch(msg.src, { type: "RESPOND_RENDERER_ADDR", addr: children.renderer });
			break;
		}
	}
}

RootActor.startup = ({ dispatch, spawn }) => {
	dispatch(spawn.renderer(RendererActor), { type: "STARTUP" });
	spawn.session(SessionActor);
};
