import "babel-polyfill";
import { dissocPath, assocPath } from "ramda";
import React from "react";
import ReactDOM from "react-dom";

function App({ state, dispatch }) {
	console.log("App", state);

	React.useEffect(() => {
		dispatch("abc", { type: "helloWorld" });
	}, [state.foo.baz, dispatch]);

	return <div />;
}

function main() {
	let state = {};
	const logicWorker = new Worker("./logic/system.js");

	function applySingleDelta(delta) {
		if (delta.value === undefined) {
			state = dissocPath(delta.path, state);
		} else {
			state = assocPath(delta.path, delta.value, state);
		}
	}

	logicWorker.addEventListener("message", (event) => {
		const msg = event.data;
		if (Array.isArray(msg)) {
			msg.forEach(applySingleDelta);
		} else {
			applySingleDelta(msg);
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
