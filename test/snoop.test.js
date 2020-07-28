import "babel-polyfill";
import createActorSystem from "../src";

async function* childActor({ dispatch, parent }) {}

it("informs the snoop function of what's going on inside the system", () => {
	const snoop = jest.fn();

	createActorSystem({ snoop })(async function* rootActor({
		spawn,
		dispatch,
	}) {});
});
