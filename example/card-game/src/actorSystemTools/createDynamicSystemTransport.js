export default function createDynamicSystemTransportSet() {
	const configs = [];
	const doDispatchTo = new Map();

	return function createDynamicSystemTransport(fromConfig) {
		configs.push(fromConfig);

		return function dynamicTransport(doDispatch) {
			doDispatchTo.set(fromConfig, doDispatch);

			return function handle(snk, msg) {
				if (!msg.src) {
					return false;
				}

				for (const toConfig of configs) {
					if (toConfig === fromConfig) {
						continue;
					}
					if (!toConfig.accept(snk, msg)) {
						continue;
					}
					const transformed = toConfig.transformIncoming(
						...fromConfig.transformOutgoing(snk, msg),
					);

					const dispatch = doDispatchTo.get(toConfig);
					dispatch(transformed[1].src, transformed[0], transformed[1]);
				}
				return false;
			};
		};
	};
}
