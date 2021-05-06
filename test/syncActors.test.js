import { createTestSystem } from "./utils.js";
/*import "babel-polyfill";*/
//import createActorSystem from "../src";

//function* childActor({ parent, dispatch }) {
//const msg = yield;
//dispatch(parent, msg);
//}

//it("works with sync actors too", (done) => {
//createActorSystem()(function* testActor({ spawn, dispatch, self }) {
//const child = spawn(childActor);
//dispatch(child, { test: true });
//const reply = yield;

//expect(reply).toEqual({
//test: true,
//src: self,
//});

//done();
//});
