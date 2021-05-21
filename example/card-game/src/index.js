import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";

import system from "./system";
import RootActor from "./actors/Root";
import App from "./components/App";
import { SystemProvider } from "./components/useActor";

function main() {
	localStorage.rootAddr = localStorage.rootAddr || system.spawn.root(RootActor);

	ReactDOM.render(
		<SystemProvider system={system}>
			<App rootAddr={localStorage.rootAddr} />
		</SystemProvider>,
		document.getElementById("app"),
	);
}

main();
//setTimeout(main, 0);
