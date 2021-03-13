import "babel-polyfill";
import createActorSystem from "../src";

describe("root actor address", () => {
	it("should always send messages addressed to 'root' to the root actor", (done) => {
		function* ChildActor({ dispatch }) {
			dispatch("root", { type: "TEST_MESSAGE" });
		}

		function* RootActor({ spawn }) {
			spawn(ChildActor);

			const msg = yield;

			expect(msg).toMatchObject({
				type: "TEST_MESSAGE",
			});

			done();
		}

		createActorSystem()(RootActor);
	});
});
