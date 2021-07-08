import "babel-polyfill";
import { mergeDeepRight, dissocPath, assocPath } from "ramda";
import React from "react";
import ReactDOM from "react-dom";

import App from "./render/components/App";

function main() {
	let state = {};
	const logicWorker = new Worker("./logic/index.js");

	logicWorker.addEventListener("message", (event) => {
		const msg = event.data;

		if (msg.type === "RENDER_DIFF_BUFFER") {
			console.log(msg);
			state = mergeDeepRight(state, msg.payload);
			renderApp();
		}

		if (msg.id === "_console_") {
			console[msg.method ?? "log"](...msg.args);
		}
	});

	function dispatch(snk, msg) {
		logicWorker.postMessage({ type: "_ingrates_", snk, msg, src: "render" });
	}

	function renderApp() {
		ReactDOM.render(<App dispatch={dispatch} state={state} />, document.getElementById("app"));
	}
}

main();
