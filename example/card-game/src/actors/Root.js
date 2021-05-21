import system from "../system";

import RendererActor from "./Renderer";
import SessionActor from "./Session";

system.register(RootActor);

export default function RootActor({ msg, dispatch, children, log }) {
	switch (msg.type) {
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
