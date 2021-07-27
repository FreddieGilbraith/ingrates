export default function createDynamicSystemTransport() {
	return function dynamicSystemTransport(doDispatch) {
		return function handle(snk, msg) {
			if (snk === "DynamicSystemTransport") {
				console.log({ snk, msg });
				return true;
			}
		};
	};
}
