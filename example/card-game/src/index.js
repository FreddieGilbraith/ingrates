import "babel-polyfill";
import { dissocPath, assocPath } from "ramda";
import React from "react";
import ReactDOM from "react-dom";

import App from "./render/components/App";

function main() {
	let state = {};
	const logicWorker = new Worker("./logic/index.js");

	function applySingleDelta({ msg: delta }) {
		if (delta.value === undefined) {
			state = dissocPath(delta.path, state);
		} else {
			state = assocPath(delta.path, delta.value, state);
		}
	}

	logicWorker.addEventListener("message", (event) => {
		const msg = event.data;

		if (msg.id === "_render_") {
			if (Array.isArray(msg.payload)) {
				msg.payload.forEach(applySingleDelta);
			} else {
				applySingleDelta(msg.payload);
			}
		}

		if (msg.id === "_console_") {
			console[msg.method ?? "log"](...msg.args);
		}

		renderApp();
	});

	function dispatch(snk, msg) {
		logicWorker.postMessage({ type: "_ingrates_", snk, msg, src: "render" });
	}

	function renderApp() {
		ReactDOM.render(<App dispatch={dispatch} state={state} />, document.getElementById("app"));
	}
}

main();
