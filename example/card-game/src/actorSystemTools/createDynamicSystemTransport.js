export default function createDynamicSystemTransportSet() {
	const doDispatchTo = {};

	return function createDynamicSystemTransport(myName) {
		return function dynamicTransport(doDispatch) {
			doDispatchTo[myName] = doDispatch;

			return function handle(snk, msg) {
				if (!msg.src) {
					return false;
				}

				for (const systemName of Object.keys(doDispatchTo)) {
					if (snk.startsWith(systemName)) {
						const [theirName, snkAddr] = snk.split(":");

						const namespacedSrc = [myName, msg.src].join(":");

						doDispatchTo[theirName](namespacedSrc, snkAddr, {
							...msg,
							src: namespacedSrc,
						});

						return true;
					}
				}
			};
		};
	};
}
