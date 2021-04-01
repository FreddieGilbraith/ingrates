import "babel-polyfill";

import createActorSystem from "../src";

async function* networkEnabledActor({ dispatch, parent }) {
	const _msg1 = yield;
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
		return ({ msg, snk }) => {
			if (snk.startsWith("database@")) {
				mockFetchSelective(`actor/${snk.replace("database@", "")}`, {
					body: msg,
				});
				return true;
			} else {
				return false;
			}
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
