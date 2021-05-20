import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";

import system from "./system";
import RootActor from "./actors/Root";
import App from "./components/App";
import { SystemProvider } from "./components/useActor";

function main() {
	const rootAddr = system.spawn.root(RootActor);
	ReactDOM.render(
		<SystemProvider system={system}>
			<App rootAddr={rootAddr} />
		</SystemProvider>,
		document.getElementById("app"),
	);
}

setTimeout(main, 0);
