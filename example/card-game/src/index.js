import * as style from "./index.css";

import "babel-polyfill";
import { mergeDeepRight } from "ramda";
import React from "react";
import ReactDOM from "react-dom";

import App from "./components/App";

("min-h-full");

function main() {
	console.log({ style });

	let state = {};

	const logicWorker = new Worker(new URL("./actors/start.js", import.meta.url), {
		type: "module",
	});

	logicWorker.addEventListener("message", (event) => {
		const msg = event.data;

		if (msg.type === "RENDER_DIFF_BUFFER") {
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
