#!/usr/bin/env node

const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const marked = require("marked");

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

function H(statics, ...args) {
	return (...props) => {
		let i = 0;
		let j = 0;
		const acc = [];
		for (const staticX of statics) {
			acc.push(staticX);
			const arg = args[i++];

			if (arg === null) {
				acc.push(props[j++]);
			} else {
				acc.push(arg);
			}
		}
		return acc.join("");
	};
}

const Link = H`
<a class="px-1 text-white underline" href="${null}">${null}</a>
`;

const Header = H`
<header class="p-2 bg-pink-800 text-white text-sm md:text-lg shadow fixed top-0 left-0 right-0 flex">
	<div class="flex-1">Ingrates</div>
	
	${Link("/api", "API")}
	${Link("/Guide", "Guide")}
	${Link("https://github.com/FreddieGilbraith/ingrates", "Github")}
</header>

<div> <div class="h-10 block"></div> </div>
`;

const App = H`
<html>
	<head>
		<link href="/index.css" rel="stylesheet">
	</head>
	<body class="flex flex-col items-stretch">
		${Header()}
		${null}
	</body>
</html>
`;

const USPSection = H`
<div class="p-2 flex-1 max-w-lg lg:max-w-sm">
	<section class="p-2">
		<h3 class="text-center text-2xl pb-1">${null}</h3>
		<hr/>
		<div class="pt-2 text-center">${null}</div>
	</section>
</div>
`;

const HomePage = H`
<div class="
	p-8 flex flex-col items-center
	shadow-inner
	text-white
	bg-gradient-to-t from-red-500 to-pink-400 
">
	<h2 class="text-2xl">
		Acting <span class="italic">is Reacting</span>
	</h2>

	<h1 class="text-9xl pb-2">Ingrates</h1>
	<aside class="text-lg py-2">A tiny javascript actor system</aside>

	<a href="https://www.npmjs.com/package/@little-bonsai/ingrates" class="flex justify-evenly w-full max-w-xs">
		<img src="https://badgen.net/bundlephobia/minzip/@little-bonsai/ingrates"/>
		<img src="https://badgen.net/npm/v/@little-bonsai/ingrates"/>
	</a>
</div>

<div class="
	self-center max-w-7xl w-full p-2
	flex flex-col lg:flex-row justify-evenly items-center lg:items-stretch
">
	${USPSection(
		"Async",
		`Make use of the actor system to simplify complex async workloads,
		encapsulate your logic and communicate with decoupled messages`,
	)}
	${USPSection(
		"Safe",
		`Each actor runs in isolation so errors are contained,
		one actor crashing doesn't mean catastrophe`,
	)}
	${USPSection(
		"Portable",
		`Runs the same on the server and the browser,
		and provides great tooling for communication between the two`,
	)}
</div>

<hr/>

<pre class="p-2 self-center max-w-full">
<code>import createActorSystem from "@little-bonsai/ingrates";

createActorSystem()(rootActor);

async function* rootActor({ spawn, self, dispatch }) {
  const myChild = spawn(childActor, "Bert", "Jurnegen");

  dispatch(myChild, { type: "HELLO" });

  while (true) {
    const msg = yield;
    if (msg.type === "GOODBYE") {
      console.log("Please... my son. He's very sick");
    }
  }
}

async function* childActor({ parent, dispatch }, firstname, lastname) {
  const msg = yield;

  if (msg.type === "HELLO") {
    dispatch(msg.src, {
      type: "GOODBYE",
      msg: \`say goodbye to \${firstname} \${lastname}\`,
    });
  }
}</code>
</pre>

<div class="flex-1"></div>
`;

const Markdowned = H`
<div id="markdown-content" class="p-2 max-w-2xl w-full self-center">
${null}
<div>
`;

async function convertMDToHTML(name) {
	try {
		const inPath = path.join(__dirname, `${name}.md`);
		const outPath = path.join(__dirname, "..", "build", `${name}.html`);
		const markdown = await readFile(inPath, "utf8");
		const html = App(Markdowned(marked(markdown)));
		await writeFile(outPath, html);
	} catch (e) {
		console.error(e);
	}
}

async function writeToBuild(writePath, content) {
	const fullPath = path.join(__dirname, "..", "build", writePath);
	await writeFile(fullPath, content);
}

(async function main() {
	await writeToBuild("index.html", App(HomePage()));
	await convertMDToHTML("api");
	//await convertMDToHTML("guide");
})();
