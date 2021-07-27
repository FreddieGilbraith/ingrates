export default function createSignpostTransport({ read, write }) {
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
