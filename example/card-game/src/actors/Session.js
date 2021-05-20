import system from "../system";

system.register(SessionActor);

export default async function SessionActor({ msg, dispatch, children, state, log }) {
	log(state);
	return state;
}

SessionActor.startup = async ({ query, parent, self, dispatch }) => {
	dispatch(self, { type: "YO" });
};
