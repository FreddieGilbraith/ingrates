import fixedId from "fixed-id";
import { createSerialPager } from "./index.js";

function wait(x) {
	return new Promise((y) => setTimeout(y, x));
}

let objectsFetched = 0;
let fetchesInFlight = 0;

const PAGE_FETCH_TIME = 1000;
async function fetchPage(n) {
	fetchesInFlight++;
	await wait(Math.random() * (DATA_PROCESS_TIME + PAGE_FETCH_TIME * fetchesInFlight));

	fetchesInFlight--;

	return new Array(Math.ceil(Math.random() * 10)).fill(null).map(() => ({
		i: objectsFetched++,
		id: fixedId(),
	}));
}

const DATA_PROCESS_TIME = 200;
async function processObject(obj) {
	console.log("process", obj);
	await wait((1 + Math.random()) * DATA_PROCESS_TIME);
	console.log("processed", obj);
}

(async function main() {
	const serialPager = createSerialPager(fetchPage);
	let i = 0;
	for await (const obj of serialPager) {
		i++;
		await processObject(obj);

		if (i % 4) {
			console.log(await serialPager.getStats());
		}
	}
})();
