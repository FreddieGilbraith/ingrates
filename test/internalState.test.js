import { createTestSystem } from "./utils.js";

const test = createTestSystem();

function SyncActorWithInternalState({ dispatch, self, msg, state }, { t, done }) {
	switch (msg.type) {
		case "Mount": {
			t.plan(1);
			dispatch(self, { type: "INC" });
			dispatch(self, { type: "INC" });
			dispatch(self, { type: "INC" });
			dispatch(self, { type: "DONE" });
			return {
				counter: 3,
			};
		}

		case "INC": {
			return {
				...state,
				counter: state.counter + 1,
			};
		}

		case "DONE": {
			t.is(state.counter, 6);
			done();
			break;
		}

		default:
			break;
	}

	return state;
}

test(SyncActorWithInternalState);

async function AsyncActorWithInternalState({ dispatch, self, msg, state }, { t, done }) {
	switch (msg.type) {
		case "Mount": {
			t.plan(1);
			dispatch(self, { type: "INC" });
			dispatch(self, { type: "INC" });
			dispatch(self, { type: "INC" });
			dispatch(self, { type: "DONE" });
			return {
				counter: 3,
			};
		}

		case "INC": {
			return {
				...state,
				counter: state.counter + 1,
			};
		}

		case "DONE": {
			t.is(state.counter, 6);
			done();
			break;
		}

		default:
			break;
	}

	return state;
}

test(AsyncActorWithInternalState);
