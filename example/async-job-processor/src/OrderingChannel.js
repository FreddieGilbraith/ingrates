export default function OrderingChannel(
	{ dispatch, self, msg, state = { buffer: [], i: 0 } },
	downstream,
) {
	if (msg.i === state.i) {
		dispatch(downstream, msg);
		state.buffer.forEach((msg) => dispatch(self, msg));
		return {
			i: state.i + 1,
			buffer: [],
		};
	} else {
		return {
			...state,
			buffer: [...state.buffer, msg],
		};
	}
}
