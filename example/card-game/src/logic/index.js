import "babel-core/register";
import "babel-polyfill";

import system from "./system";

function Root({ msg, dispatch, log }) {
	log(msg);

	if (msg.src === "render" && msg.type === "RenderReady") {
		dispatch("render", {
			path: ["engine", "status"],
			value: "ready",
		});
	}
}

Root.startup = ({ self, dispatch, log }) => {
	dispatch("render", {
		path: ["engine", "status"],
		value: "init",
	});
	dispatch("render", {
		path: ["engine", "addr"],
		value: self,
	});
	log("started root actor");
};

system.register(Root);
system.spawn.root(Root);
