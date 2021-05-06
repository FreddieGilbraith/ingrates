import { createTestSystem } from "./utils.js";
//import "babel-polyfill";

//import createActorSystem from "../src";

//describe("decorators", () => {
//it("should provide a useful syntax for decorating actors", (done) => {
//expect.assertions(2);

//function withPing(x) {
//return function createActorWithPing(...args) {
//const itter = x(...args);

//return {
//next: (msg) => {
//if (msg?.type === "PING") {
//args[0].dispatch(msg.src, { type: "PONG" });
//return {
//value: null,
//done: false,
//};
//} else {
//return itter.next(msg);
//}
//},
//};
//};
//}

//function* BobActor({ dispatch }) {
//while (true) {
//const msg = yield;

//switch (msg.type) {
//case "PING": {
//dispatch(msg.src, { type: "PONG" });
//break;
//}
//case "ADD": {
//dispatch(msg.src, {
//type: "RESULT",
//value: msg.lhs + msg.rhs,
//});
//break;
//}
//default:
//continue;
//}
//}
//}

//const BobWithPingActor = withPing(BobActor);

//createActorSystem()(function* testActor({ spawn, dispatch }) {
//const bob = spawn(BobWithPingActor);

//dispatch(bob, { type: "PING" });
//const msg1 = yield;
//expect(msg1).toEqual({ src: bob, type: "PONG" });

//dispatch(bob, { type: "ADD", lhs: 1, rhs: 2 });
//const msg2 = yield;
//expect(msg2).toEqual({ src: bob, type: "RESULT", value: 3 });

//done();
//});
//});
//});
