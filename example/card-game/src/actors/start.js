import "babel-core/register";
import "babel-polyfill";

import createEngineActorSystem from "./Engine/system";
import createConfigActorSystem from "./Config/system";

import EngineRoot from "./Engine/Root";
import ConfigRoot from "./Config/Root";

function createStaticSystemTransports(systemNames) {
	const doDispatchTo = {};

	return Object.fromEntries(
		systemNames.map((myName) => [
			myName,
			function staticTransport(doDispatch) {
				doDispatchTo[myName] = doDispatch;

				return function handle(snk, msg) {
					if (!msg.src) {
						return false;
					}

					for (const systemName of systemNames) {
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
			},
		]),
	);
}

const staticSystemTransports = createStaticSystemTransports(["Engine", "Config"]);

const engineActorSystem = createEngineActorSystem(staticSystemTransports.Engine);
const configActorSystem = createConfigActorSystem(staticSystemTransports.Config);

const configAddr = "Config:" + configActorSystem.spawn(ConfigRoot);
engineActorSystem.spawn(EngineRoot, configAddr);
