const H = require("./H");
const highlight = require("./highlight");

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
	<h1 class="text-7xl lg:text-9xl pb-2">Ingrates</h1>
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
		`Make use of the actor model to simplify complex async workloads,
		encapsulate your logic and communicate with decoupled messages`,
	)}
	${USPSection(
		"Safe",
		`Each actor runs in isolation so errors are contained,
		one actor crashing doesn't mean catastrophe`,
	)}
	${USPSection(
		"Portable",
		`Runs the same on the server and the browser (with no build step),
		and provides great tooling for communication between the two`,
	)}
</div>

<hr/>

<pre class="p-2 self-center max-w-full">
<code>${highlight(
	`import createActorSystem from "@little-bonsai/ingrates";

async function* ChildActor({ parent, dispatch }, firstname, lastname) {
  const msg = yield;

  if (msg.type === "HELLO") {
    dispatch(msg.src, {
      type: "GOODBYE",
      msg: \`say goodbye to \${firstname} \${lastname}\`,
    });
  }
}

async function* RootActor({ spawn, self, dispatch }) {
  const myChild = spawn(ChildActor, "Bert", "Jurnegen");

  dispatch(myChild, { type: "HELLO" });

  while (true) {
    const msg = yield;
    if (msg.type === "GOODBYE") {
      console.log("Please... my son. He's very sick");
    }
  }
}


createActorSystem()(RootActor);`,
	"javascript",
)}</code>
</pre>

<div class="flex-1"></div>
`;

module.exports = HomePage;
