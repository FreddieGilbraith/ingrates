import { createActorSystem } from "../../src/index.js";

import OrderingChannel from "./src/OrderingChannel.js";
import Statistician from "./src/Statistician.js";

export function createSerialPager(pageFetcher) {
	function BufferedQueue(
		{ msg, dispatch, self, state = { data: [], pullRequests: [] } },
		statistician,
	) {
		dispatch(statistician, msg);

		switch (msg.type) {
			case "RESOLVED_PAGE": {
				state.pullRequests.forEach(dispatch.bind(null, self));

				return {
					...state,
					pullRequests: [],
					data: [...state.data, ...msg.page],
				};
			}

			case "REQUEST_NEXT": {
				if (state.data.length) {
					const [head, ...tail] = state.data;
					msg.done(head);
					return {
						...state,
						data: tail,
					};
				} else {
					return {
						...state,
						pullRequests: [...state.pullRequests, msg],
					};
				}
			}

			default: {
				console.log("BufferedQueue", msg);
			}
		}
		return state;
	}

	async function PageFetcher({ self, msg, dispatch, parent, state = 0 }, downstream) {
		switch (msg.type) {
			case "REQUEST_PAGE": {
				const i = state;
				pageFetcher(i).then((page) =>
					dispatch(downstream, { type: "RESOLVED_PAGE", i, page }),
				);
				return state + 1;
			}
			default: {
				console.log("PageFetcher", msg);
			}
		}

		return state;
	}

	function RootActor({ msg, dispatch, children }) {
		switch (msg.type) {
			case "REQUEST_NEXT": {
				dispatch(children.statistician, msg);
				dispatch(children.queue, msg);
				return;
			}

			case "REQUEST_STATS": {
				dispatch(children.statistician, msg);
				return;
			}

			default: {
				console.log("RootActor", msg);
			}
		}
	}

	RootActor.startup = ({ spawn, dispatch }) => {
		const statistician = spawn.statistician(Statistician);
		const queue = spawn.queue(BufferedQueue, statistician);
		const orderer = spawn.orderer(OrderingChannel, queue);
		const source = spawn.fetcher(PageFetcher, orderer);

		dispatch(statistician, { type: "INTRO_SOURCE", source });

		dispatch(source, { type: "REQUEST_PAGE" });
		dispatch(source, { type: "REQUEST_PAGE" });
		dispatch(source, { type: "REQUEST_PAGE" });
	};

	//////////////////////////////

	const system = createActorSystem();
	system.register(BufferedQueue);
	system.register(OrderingChannel);
	system.register(PageFetcher);
	system.register(RootActor);
	system.register(Statistician);

	const rootAddr = system.spawn.root(RootActor);

	function getStats() {
		return new Promise((done) => system.dispatch(rootAddr, { type: "REQUEST_STATS", done }));
	}
	function next() {
		return new Promise((done) =>
			system.dispatch(rootAddr, { type: "REQUEST_NEXT", done }),
		).then((value) => ({
			value,
			done: false,
		}));
	}

	return {
		getStats,
		[Symbol.asyncIterator]() {
			return {
				next,
			};
		},
	};
}
