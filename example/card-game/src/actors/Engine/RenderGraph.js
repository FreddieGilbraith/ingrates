import * as R from "ramda";

import { register } from "./system";

register(RenderGraph);

export default function RenderGraph({ parent, msg, log, dispatch, self, state = {} }) {
	switch (msg.type) {
		case "Mount": {
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

			return R.identity;
		}

		case "IntroEngine": {
			dispatch(parent, { type: "ConfirmStartup" });
			break;
		}

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

		default: {
			if (msg.type !== "Start" && msg.type !== "Mount") log(msg);
			break;
		}
	}
}
