import { createTestSystem } from "./utils.js";

function EchoActor({ msg, dispatch }) {
	if (msg.type === "ECHO") {
		dispatch(msg.src, { type: "ECHO", payload: msg.payload });
	}
}

function pingPongTransport(rawDispatch) {
	let calls = 0;
	return (snk, msg) => {
		calls++;
		if (snk === "pinger") {
			rawDispatch("pinger", msg.src, { type: "PONG", calls });
			return true;
		}
	};
}

function reverserTransport(rawDispatch) {
	let calls = 0;
	return (snk, msg) => {
		calls++;
		if (snk === "reverser") {
			rawDispatch("reverser", msg.src, {
				type: "REVERSED",
				payload: msg.payload.split("").reverse().join(""),
				calls,
			});
			return true;
		}
	};
}

const test = createTestSystem({
	actors: [EchoActor],
	transports: [pingPongTransport, reverserTransport],
});

test(function TransportCallingActor({ self, dispatch, msg, state, spawn, children }, { t, done }) {
	switch (msg.type) {
		case "START_TEST": {
			dispatch(spawn.echoer(EchoActor), { type: "ECHO", payload: "hello" });
			dispatch("pinger", { type: "PING" });
			dispatch("reverser", { type: "REVERSE", payload: "world" });

			return {
				resolved: 0,
			};
		}

		case "ECHO": {
			t.like(msg, { type: "ECHO", payload: "hello", src: children.echoer });
			dispatch(self, { type: "MAYBE_DONE" });
			return {
				resolved: state.resolved + 1,
			};
		}

		case "PONG": {
			t.like(msg, { type: "PONG", src: "pinger", calls: 3 });
			dispatch(self, { type: "MAYBE_DONE" });
			return {
				resolved: state.resolved + 1,
			};
		}

		case "REVERSED": {
			t.like(msg, { type: "REVERSED", src: "reverser", payload: "dlrow", calls: 3 });
			dispatch(self, { type: "MAYBE_DONE" });
			return {
				resolved: state.resolved + 1,
			};
		}

		case "MAYBE_DONE": {
			if (state.resolved >= 3) {
				dispatch(self, { type: "DONE" });
			}
			break;
		}

		case "DONE": {
			done();
			break;
		}

		default: {
			break;
		}
	}
});
