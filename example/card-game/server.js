#!/usr/bin/env node

import { server as WebSocketServer } from "websocket";
import http from "http";

const server = http.createServer(function (request, response) {
	console.log(new Date() + " Received request for " + request.url);
	response.writeHead(404);
	response.end();
});

server.listen(2345, function () {
	console.log(new Date() + " Server is listening on port 2345");
});

const wsServer = new WebSocketServer({
	httpServer: server,
	// You should not use autoAcceptConnections for production
	// applications, as it defeats all standard cross-origin protection
	// facilities built into the protocol and the browser.  You should
	// *always* verify the connection's origin and decide whether or not
	// to accept it.
	autoAcceptConnections: false,
});

function originIsAllowed(origin) {
	// put logic here to detect whether the specified origin is allowed.
	return true;
}

const connections = {};

wsServer.on("request", function (request) {
	console.log("xxx", request.remoteAddress);

	var connection = request.accept("echo-protocol", request.origin);

	connections[request.origin] = connection;

	console.log(new Date() + " Connection accepted.");

	connection.on("message", function (message) {
		try {
			if (message.type === "utf8") {
				const parsed = JSON.parse(message);

				console.log(parsed);
				//connection.sendUTF(message.utf8Data);
			}
		} catch (e) {}
	});

	connection.on("close", function (reasonCode, description) {
		console.log(new Date() + " Peer " + connection.remoteAddress + " disconnected.");
	});
});
