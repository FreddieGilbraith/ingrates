export default function Statistician({ msg, state }) {
	switch (msg.type) {
		case "REQUEST_PAGE": {
			return {
				...state,
				requestStartTimes: {
					...state.requestStartTimes,
					[msg.i]: Date.now(),
				},
			};
		}

		case "REQUEST_NEXT": {
			const duration = Date.now() - state.drainTime;
			return {
				...state,
				totalDrains: state.totalDrains + 1,
				drainTime: Date.now(),
				drainDurations: [...state.drainDurations, duration],
			};
		}

		case "RESOLVED_PAGE": {
			const { [msg.i]: requestStartTime, ...requestStartTimes } = state.requestStartTimes;
			const duration = Date.now() - requestStartTime;

			return {
				...state,
				totalRequests: state.totalRequests + 1,
				requestStartTimes,
				pageSizes: [...state.pageSizes, msg.page.length],

				requestDurations: [...state.requestDurations, duration],
			};
		}

		case "INTRO_SOURCE": {
			return {
				...state,
				source: msg.source,
			};
		}

		case "REQUEST_STATS": {
			console.log("Statistician.REQUEST_STATS", msg, state);
			break;
		}

		default: {
			console.log("Statistician", msg, state);
		}
	}

	return state;
}

Statistician.startup = () => ({
	totalRequests: 0,
	totalDrains: 0,
	drainTime: Date.now(),
	drainDurations: [],
	pageSizes: [],
	requestDurations: [],
});
