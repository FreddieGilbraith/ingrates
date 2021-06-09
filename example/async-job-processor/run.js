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

	const data = new Array(Math.ceil(Math.random() * 10)).fill(null).map(() => ({
		i: objectsFetched++,
		id: fixedId(),
	}));

	await wait(Math.random() * (DATA_PROCESS_TIME + PAGE_FETCH_TIME * (fetchesInFlight / 2)));

	fetchesInFlight--;
	return data;
}

const DATA_PROCESS_TIME = 200;
async function processObject(obj) {
	const duration = Math.floor((1 + Math.random()) * DATA_PROCESS_TIME);
	await wait(duration);
	console.log("processed", duration, obj);
}

(async function main() {
	const serialPager = createSerialPager(fetchPage);
	let i = 0;
	for await (const obj of serialPager) {
		i++;
		await processObject(obj);

		if (i % 10 === 0) {
			console.log(await serialPager.getStats());
		}
	}
})();
