import "babel-polyfill";
import { nanoid } from "nanoid";

import createActorSystem from "../src";

async function* networkEnabledActor({ dispatch, parent }) {
	const msg1 = yield;
	dispatch("database@users", {
		type: "QUERY",
		userId: 123,
		respondWith: "RESPONSE",
	});
	dispatch(parent, { type: "STARTED_QUERY" });

	const msg2 = yield;
	dispatch(parent, { type: "RESPONSE", msg: msg2 });
}

it("will communicate with transports", (done) => {
	const mockFetchSelective = jest.fn();
	let replyFromDb = () => {};

	function selectiveTransport(dispatch) {
		replyFromDb = dispatch;
		return {
			match: ({ src, msg, snk }) => snk.startsWith("database@"),
			handle: ({ src, msg, snk }) =>
				mockFetchSelective(`actor/${snk.replace("database@", "")}`, {
					body: msg,
				}),
		};
	}

	createActorSystem({
		transports: [selectiveTransport],
	})(async function* testActor({ spawn, dispatch }) {
		const netActor = spawn(networkEnabledActor);
		dispatch(netActor, { type: "ASK_FOR_USER" });

		yield;

		expect(mockFetchSelective).toHaveBeenCalledWith(`actor/users`, {
			body: { type: "QUERY", userId: 123, respondWith: "RESPONSE" },
		});

		// ------------------------------

		replyFromDb({
			snk: netActor,
			src: "database@user",
			msg: { type: "RESPONSE", userEnabled: true },
		});

		const output = yield;

		expect(output).toEqual({
			type: "RESPONSE",
			msg: {
				type: "RESPONSE",
				userEnabled: true,
				src: "database@user",
			},
			src: netActor,
		});
		done();
	});
});
