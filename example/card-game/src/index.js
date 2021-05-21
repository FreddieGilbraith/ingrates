import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";

import system from "./system";
import RootActor from "./actors/Root";
import App from "./components/App";

function main() {
	localStorage.rootAddr = localStorage.rootAddr || system.spawn.root(RootActor);
	console.log("start render");
	ReactDOM.render(<App rootAddr={localStorage.rootAddr} />, document.getElementById("app"));
}

main();
//setTimeout(main, 0);
