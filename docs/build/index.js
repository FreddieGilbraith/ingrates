#!/usr/bin/env node

const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const marked = require("marked");

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);

const H = require("./H");
const highlight = require("./highlight");
const HomePage = require("./homePage");
const { App, Markdowned } = require("./page");

marked.setOptions({ highlight });

async function convertMDToHTML(name) {
	try {
		const inPath = path.join(__dirname, "..", "src", `${name}.md`);
		const outPath = path.join(__dirname, "..", "out", `${name}.html`);
		const markdown = await readFile(inPath, "utf8");
		const html = App(Markdowned(marked(markdown)));
		await writeFile(outPath, html);
	} catch (e) {
		console.error(e);
	}
}

async function writeToBuild(writePath, content) {
	const fullPath = path.join(__dirname, "..", "out", writePath);
	await writeFile(fullPath, content);
}

(async function main() {
	try {
		await mkdir(path.join(__dirname, "..", "out"));
	} catch (_) {}

	await writeToBuild("index.html", App(HomePage()));
	await convertMDToHTML("api");
	await convertMDToHTML("guide");
	await convertMDToHTML("eco");
})();
