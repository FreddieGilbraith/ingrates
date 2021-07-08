import * as R from "ramda";
import system from "../system";

system.register(RenderGraph);

function buildDiff(o, path = []) {
	switch (R.type(o)) {
		case "Array": {
			return o.map((x, i) => buildDiff(x, [...path, i])).flat();
		}

		case "Object": {
			return Object.entries(o)
				.map(([key, val]) => buildDiff(val, [...path, key]))
				.flat();
		}

		default: {
			return [[path, o]];
		}
	}
}

export default function RenderGraph({ msg, log, dispatch, self, state }) {
	switch (msg.type) {
		case "flushDiffBuffer": {
			if (state.diffBuffer) {
				postMessage({
					type: "RENDER_DIFF_BUFFER",
					payload: state.diffBuffer,
				});
			}

			return R.pipe(R.dissoc("queueFlushId"), R.dissoc("diffBuffer"));
		}

		case undefined: {
			return R.pipe(
				R.assocPath(["diffBuffer", ...msg.path], msg.value),
				R.assocPath(["graph", ...msg.path], msg.value),

				state.queueFlushId
					? R.identity
					: R.assoc(
							"queueFlushId",
							setTimeout(dispatch, 64, self, {
								type: "flushDiffBuffer",
							}),
					  ),
			);
		}

		default:
			log(msg);
			return state;
	}

	return state;
}

RenderGraph.startup = ({ dispatch }) => {
	dispatch("singletonSignpost", {
		type: "register",
		name: "render",
	});

	onmessage = function onMessage(event) {
		const msg = event.data;

		if (msg.type === "_ingrates_") {
			dispatch(msg.snk, { ...msg.msg, src: "render" });
		}
	};

	return {};
};
