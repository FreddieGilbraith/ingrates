import { nanoid } from "nanoid";
import * as R from "ramda";

export function defineActor(name, fn) {
	return function createActorInstance(system, ...args) {};
}

export function mountRoot(createRootActor, ...args) {
	const rootActorId = nanoid();

	let world = {};

	function dispatch(sender, dest, msg) {
		world = R.over(
			R.lensPath(["mail", dest]),
			R.pipe(
				R.defaultTo([]),
				R.append({
					msg,
					sender,
				}),
			),
			world,
		);
	}

	function subscribe() {}
	function getState() {}
	async function* stream() {
		yield {
			type: "MOCK",
		};
	}

	return {
		dispatch: dispatch.bind(null, "__EXTERNAL__"),
		subscribe,
		getState,
		stream,
	};
}
