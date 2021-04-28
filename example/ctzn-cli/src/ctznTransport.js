import createActorSystem from "@little-bonsai/ingrates";
import websocketLib from "websocket";

import logEnhancer from "./logEnhancer.js";

const { client: WebSocketClient } = websocketLib;

async function* SocketClientActor({ parent, dispatch, log }, host) {
	let id = 1;
	const responseBundles = {};

	const client = await new Promise((done, fail) => {
		const client = new WebSocketClient();
		client.on("connectFailed", log.bind(null, "client.connectFailed", host));
		client.on("connect", done);
		client.connect(`wss://${host}`, "echo-protocol");
		return client;
	});

	log(host, "Connected");

	client.on("error", console.error.bind(null, "socket", host, "error"));
	client.on("close", console.info.bind(null, "socket", host, "close"));
	client.on("message", (incoming) => {
		if (incoming.type === "utf8") {
			const parsed = JSON.parse(incoming.utf8Data);

			const { id, jsonrpc, ...msg } = parsed;
			const { type, src: snk } = responseBundles[id];
			delete responseBundles[id];

			dispatch(parent, {
				type: "RECIEVED_CTZN_MESSAGE",
				snk,
				src: `ctzn://${host}`,
				msg: { type: type.replace("REQUEST", "RESPOND"), ...msg },
			});
		}
	});

	while (true) {
		id++;
		const msg = yield;

		responseBundles[id] = { type: msg.msg.type, src: msg.src };

		client.sendUTF(
			JSON.stringify({
				jsonrpc: "2.0",
				id,
				method: msg.msg.method,
				params: msg.msg.params,
			}),
		);

		await new Promise((x) => setTimeout(x, 1000));
	}
}

function* TransportActor({ spawn, dispatch, parent }) {
	const socketClients = {};

	while (true) {
		const msg = yield;
		switch (msg.type) {
			case "INCOMING_CTZN_MESSAGE": {
				const { host } = new URL(msg.snk);
				socketClients[host] ||= spawn(SocketClientActor, host);
				dispatch(socketClients[host], msg);
				break;
			}

			case "RECIEVED_CTZN_MESSAGE": {
				dispatch(parent, msg);
				break;
			}
		}
	}
}

export default function ctznTransport(dispatchEnvelope) {
	let pushIntoSystem = null;

	createActorSystem({ enhancers: [logEnhancer("ctzn-trans")] })(function* ({
		spawn,
		dispatch,
		self,
	}) {
		pushIntoSystem = dispatch.bind(null, self);
		const transport = spawn(TransportActor);
		while (true) {
			const msg = yield;
			switch (msg.type) {
				case "INCOMING_CTZN_MESSAGE": {
					dispatch(transport, msg);
					break;
				}
				case "RECIEVED_CTZN_MESSAGE": {
					dispatchEnvelope(msg);
					break;
				}
			}
		}
	});

	return function handle({ snk, src, msg }) {
		if (snk.startsWith("ctzn://")) {
			pushIntoSystem({
				type: "INCOMING_CTZN_MESSAGE",
				snk,
				src,
				msg,
			});
			return true;
		}
	};
}
