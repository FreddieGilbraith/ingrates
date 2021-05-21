const socket = new WebSocket("ws://0.0.0.0:2345/", ["echo-protocol"]);

// Connection opened
socket.addEventListener("open", function (event) {
	socket.send("Hello Server!");
});

// Listen for messages
socket.addEventListener("message", function (event) {
	console.log("Message from server ", event.data);
});
