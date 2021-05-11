import { createTestSystem } from "./utils.js";

const test = createTestSystem();

function SyncActorWithInternalState({ dispatch, self, msg, state }, { t, done }) {
	switch (msg.type) {
		case "START_TEST": {
			t.plan(1);
			dispatch(self, { type: "INC" });
			dispatch(self, { type: "INC" });
			dispatch(self, { type: "INC" });
			dispatch(self, { type: "DONE" });
			break;
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
		}
	}

	return state;
}

SyncActorWithInternalState.startup = () => ({
	counter: 3,
});

test(SyncActorWithInternalState);

async function AsyncActorWithInternalState({ dispatch, self, msg, state }, { t, done }) {
	switch (msg.type) {
		case "START_TEST": {
			t.plan(1);
			dispatch(self, { type: "INC" });
			dispatch(self, { type: "INC" });
			dispatch(self, { type: "INC" });
			dispatch(self, { type: "DONE" });
			break;
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
		}
	}

	return state;
}

AsyncActorWithInternalState.startup = async () => ({
	counter: 3,
});

test(AsyncActorWithInternalState);
