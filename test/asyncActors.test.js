import { pause, createTestSystem } from "./utils.js";

async function SlowPokeActor({ dispatch, msg, state }) {
	await pause();

	const calls = (state ? state.calls : 0) + 1;

	switch (msg.type) {
		case "PING": {
			dispatch(msg.src, { type: "PONG", calls });
			break;
		}

		default:
			break;
	}

	return {
		...state,
		calls,
	};
}

const test = createTestSystem({ actors: [SlowPokeActor] });

test(function RunAsyncActorTest({ self, spawn, dispatch, msg }, { t, done }) {
	switch (msg.type) {
		case "Mount": {
			t.plan(3);
			const snail = spawn.snail(SlowPokeActor);
			dispatch(snail, { type: "PING" });
			dispatch(snail, { type: "PING" });
			dispatch(snail, { type: "PING" });
			break;
		}

		case "PONG": {
			t.like(msg, { type: "PONG" });
			if (msg.calls === 5) {
				dispatch(self, { type: "DONE" });
			}
			break;
		}

		case "DONE": {
			done();
			break;
		}

		default:
			break;
	}
});
