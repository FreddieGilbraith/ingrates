import { createActorSystem } from "../../src/index.js";

export function createSerialPager(pageFetcher) {
	function DataQueue({ msg, dispatch, self, state = { dataQueue: [] } }) {
		switch (msg.type) {
			case "REQUEST_NEXT": {
				if (state.dataQueue.length === 0) {
					return {
						...state,
						doneBuff: msg.done,
					};
				} else {
					const [value, ...rest] = state.dataQueue;

					msg.done({ value, done: false });

					return {
						...state,
						dataQueue: rest,
					};
				}
			}

			case "ENEUQUE_DATA": {
				if (state.doneBuff) {
					dispatch(self, { type: "REQUEST_NEXT", done: state.doneBuff });
					delete state.doneBuff;
				}

				return {
					...state,
					dataQueue: [...state.dataQueue, msg.page],
				};
			}

			default: {
				console.log("DataQueue", msg);
			}
		}
		return state;
	}

	async function PageFetcher({ msg, dispatch, parent, state = { pageI: 0 } }) {
		switch (msg.type) {
			case "REQUEST_PAGE": {
				const page = await pageFetcher(state.pageI);

				dispatch(parent, { type: "ENEUQUE_DATA", page });

				return {
					...state,
					pageI: state.pageI + 1,
				};
			}
			default: {
				console.log("RootActor", msg);
			}
		}

		return state;
	}

	function RootActor({ msg, dispatch, children }) {
		switch (msg.type) {
			case "REQUEST_NEXT": {
				dispatch(children.dataQueue, msg);
				break;
			}
			case "ENEUQUE_DATA": {
				dispatch(children.dataQueue, msg);
				break;
			}

			default: {
				console.log("RootActor", msg);
			}
		}
	}

	RootActor.startup = ({ spawn, dispatch }) => {
		spawn.dataQueue(DataQueue);
		dispatch(spawn.pageFetcher(PageFetcher), { type: "REQUEST_PAGE" });
	};

	const system = createActorSystem();
	system.register(DataQueue);
	system.register(PageFetcher);
	system.register(RootActor);

	const rootAddr = system.spawn.root(RootActor);

	function getStats() {
		return new Promise((done) => system.dispatch(rootAddr, { type: "REQUEST_STATS", done }));
	}
	function next() {
		return new Promise((done) => system.dispatch(rootAddr, { type: "REQUEST_NEXT", done }));
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
