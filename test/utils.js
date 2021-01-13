export function flushPromises() {
	return new Promise((done) => setImmediate(done));
}

export function pause() {
	return new Promise((x) => setTimeout(x, Math.random() * 10));
}

export function queryEnhancer({ self, spawn, dispatch }) {
	function query(snk, msg, timeout = 1000) {
		return new Promise((done, fail) => {
			function* QueryActor({ self, dispatch }) {
				dispatch(snk, msg);
				setTimeout(
					dispatch.bind(null, self, { type: "TIMEOUT" }),
					timeout,
				);

				const response = yield;

				if (response.type === "TIMEOUT") {
					fail({ type: "QUERY_TIMEOUT", timeout });
				} else {
					done(response);
				}
			}

			spawn(QueryActor);
		});
	}

	return {
		query,
	};
}
