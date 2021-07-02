import system from "../system";

system.register(RendererActor);

export default function RendererActor({ msg, state }) {
	return state;
}

RendererActor.startup = () => ({
	screen: "LOADING",
});
