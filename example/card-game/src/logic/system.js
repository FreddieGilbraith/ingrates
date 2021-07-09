import { createActorSystem, createDefaultRAMRealizer } from "../../../../src/index.js";
import acquireEnhancer from "@little-bonsai/ingrates-acquire-enhancer";
import assertEnhancer from "@little-bonsai/ingrates-assert-enhancer";
import createLogEnhancer from "@little-bonsai/ingrates-log-enhancer";
import { createQueryEnhancer, QueryActor } from "@little-bonsai/ingrates-query-enhancer";

function createSignpostTransport({ read, write }) {
	return function signpostTransport(doDispatch) {
		const signpostContainer = read();

		return function handle(snk, msg) {
			if (snk === "singletonSignpost") {
				if (msg.type === "register") {
					signpostContainer[msg.name] = msg.src;
					write(signpostContainer);
				}

				return true;
			}

			const addr = signpostContainer[snk];
			if (addr) {
				doDispatch(msg.src, addr, msg);
				return true;
			}
		};
	};
}

const actorSystem = createActorSystem({
	enhancers: [
		createLogEnhancer("logic", {
			log: (...args) =>
				postMessage({
					id: "_console_",
					method: "log",
					args,
				}),
		}),
		acquireEnhancer,
		assertEnhancer,
		createQueryEnhancer(),
	],
	transports: [
		createSignpostTransport(
			(() => {
				let signpostContainer = {};
				const read = () => signpostContainer;
				const write = (newContainer) => {
					signpostContainer = newContainer;
				};

				return { read, write };
			})(),
		),
	],
	// TODO if we flip the order, and put the persisting realizer below the RAM
	// realizer, we can automatically use it as a caching layer
	realizers: [createDefaultRAMRealizer()],
});

actorSystem.register(QueryActor);

export default actorSystem;
