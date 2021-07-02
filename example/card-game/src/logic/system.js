postMessage({
	path: ["foo", "bar"],
	value: 123,
});
postMessage({
	path: ["foo", "baz"],
	value: "abc",
});
postMessage({
	path: ["foo", "bar"],
	value: undefined,
});
postMessage([
	{
		path: ["foo", "qux"],
		value: true,
	},
	{
		path: ["foo", "qux"],
		value: false,
	},
	{
		path: ["foo", "qux"],
		value: "xyz",
	},
]);

onmessage = function onMessage(event) {
	const msg = event.data;
	console.log("in worker", msg);

	postMessage({
		path: ["hello", "world"],
		value: "Good Morning!",
	});
};
//import { createActorSystem, createDefaultRAMRealizer } from "../../../dist/index.modern.js";

//import logEnhancer from "./enhancers/log";
//import aquireEnhancer from "./enhancers/aquire";
//import assertEnhancer from "./enhancers/assert";

//import createLocalStorageRealizer from "./realizers/localStorage";

//const actorSystem = createActorSystem({
//enhancers: [logEnhancer("main"), aquireEnhancer, assertEnhancer],
//realizers: [
//createLocalStorageRealizer({ blockList: ["ReactHookActor"] }),
//createDefaultRAMRealizer(),
//],
//});

//export default actorSystem;
