import "babel-polyfill";
import createActorSystem from "../src";

import { queryEnhancer } from "./utils";

function delegationEnhancer(provisions) {
	function delegate(Delegate, ...args) {
		return Delegate(provisions, ...args);
	}

	function* delegateTo(addr, until = () => false) {
		while (true) {
			const msg = yield;
			if (until(msg)) {
				return;
			} else {
				provisions.dispatch(addr, msg);
			}
		}
	}

	return {
		delegate,
		delegateTo,
	};
}

function* ShoutingActor({ dispatch, parent }) {
	while (true) {
		const msg = yield;

		switch (msg.type) {
			case "FORMAT":
				dispatch(msg.src, {
					type: "REPLY",
					text: msg.text.toUpperCase(),
					src: parent,
				});
				break;
			default:
				continue;
		}
	}
}

function* WhisperingActor({ dispatch }, postscript) {
	running: while (true) {
		const msg = yield;

		switch (msg.type) {
			case "FORMAT":
				dispatch(msg.src, {
					type: "REPLY",
					text: msg.text.toLowerCase() + " " + postscript,
				});
				break;

			case "SWITCH":
				break running;
			default:
				continue;
		}
	}
}

describe("delegation", () => {
	it("can delegate by actor address", (done) => {
		expect.assertions(2);

		function* FormatManager({ spawn, delegateTo }) {
			while (true) {
				const shouter = spawn(ShoutingActor);

				yield* delegateTo(shouter, ({ type }) => type === "SWITCH");
			}
		}

		createActorSystem({ enhancers: [queryEnhancer, delegationEnhancer] })(
			async function* TestActor({ spawn, query }) {
				const manager = spawn(FormatManager);

				expect(
					await query(manager, {
						type: "FORMAT",
						text: "One",
					}),
				).toEqual({
					src: manager,
					type: "REPLY",
					text: "ONE",
				});

				expect(
					await query(manager, {
						type: "FORMAT",
						text: "Two",
					}),
				).toEqual({
					src: manager,
					type: "REPLY",
					text: "TWO",
				});

				done();
			},
		);
	});

	it("can delegate by actor definition", (done) => {
		expect.assertions(2);

		function* FormatManager({ spawn, delegate }) {
			while (true) {
				spawn(ShoutingActor);

				yield* delegate(WhisperingActor, "...ssh");
			}
		}

		createActorSystem({ enhancers: [queryEnhancer, delegationEnhancer] })(
			async function* TestActor({ spawn, query }) {
				const manager = spawn(FormatManager);

				expect(
					await query(manager, {
						type: "FORMAT",
						text: "Three",
					}),
				).toEqual({
					src: manager,
					type: "REPLY",
					text: "three ...ssh",
				});

				expect(
					await query(manager, {
						type: "FORMAT",
						text: "Four",
					}),
				).toEqual({
					src: manager,
					type: "REPLY",
					text: "four ...ssh",
				});

				done();
			},
		);
	});

	it("can delegate to multiple actors", (done) => {
		expect.assertions(6);

		function* FormatManager({ spawn, delegate, delegateTo }) {
			while (true) {
				const shouter = spawn(ShoutingActor);

				yield* delegateTo(shouter, ({ type }) => type === "SWITCH");

				yield* delegate(WhisperingActor, "...ssh");
			}
		}

		createActorSystem({ enhancers: [queryEnhancer, delegationEnhancer] })(
			async function* TestActor({ spawn, dispatch, query }) {
				const manager = spawn(FormatManager);

				expect(
					await query(manager, {
						type: "FORMAT",
						text: "One",
					}),
				).toEqual({
					src: manager,
					type: "REPLY",
					text: "ONE",
				});

				expect(
					await query(manager, {
						type: "FORMAT",
						text: "Two",
					}),
				).toEqual({
					src: manager,
					type: "REPLY",
					text: "TWO",
				});

				dispatch(manager, { type: "SWITCH" });

				expect(
					await query(manager, {
						type: "FORMAT",
						text: "Three",
					}),
				).toEqual({
					src: manager,
					type: "REPLY",
					text: "three ...ssh",
				});

				expect(
					await query(manager, {
						type: "FORMAT",
						text: "Four",
					}),
				).toEqual({
					src: manager,
					type: "REPLY",
					text: "four ...ssh",
				});

				dispatch(manager, { type: "SWITCH" });

				expect(
					await query(manager, {
						type: "FORMAT",
						text: "Five",
					}),
				).toEqual({
					src: manager,
					type: "REPLY",
					text: "FIVE",
				});
				expect(
					await query(manager, {
						type: "FORMAT",
						text: "Six",
					}),
				).toEqual({
					src: manager,
					type: "REPLY",
					text: "SIX",
				});

				done();
			},
		);
	});
});
