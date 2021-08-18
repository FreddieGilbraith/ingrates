const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();

const port = 3000;

app.use(express.static("public"));

/////////////////////////////////
// replacement for import maps //
/////////////////////////////////

app.get("/ingrates-runtime.js", (req, res) => {
	fs.readFile(
		path.join(__dirname, "..", "..", "dist/index.module.js"),
		"utf8",
	)
		.then((x) => x.replace(`from"nanoid";`, `from"/nanoid.js";`))
		.then((x) => res.type("application/javascript").send(x));
});

app.get("/nanoid.js", (req, res) => {
	fs.readFile(
		path.join(__dirname, "..", "..", "node_modules/nanoid/index.prod.js"),
		"utf8",
	)

		.then((x) =>
			x.replace(
				`from './url-alphabet/index.js'`,
				`from "/nanoid-url-alphabet.js";`,
			),
		)
		.then((x) => res.type("application/javascript").send(x));
});

app.get("/nanoid-url-alphabet.js", (req, res) => {
	fs.readFile(
		path.join(
			__dirname,
			"..",
			"..",
			"node_modules/nanoid/url-alphabet/index.js",
		),
		"utf8",
	).then((x) => res.type("application/javascript").send(x));
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
