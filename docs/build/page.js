const H = require("./H");

const InternalLink = H`
<a
   class="px-1 text-white"
   href="${null}"
   link="prefetch"
>
   ${null}
</a>`;

const ExternalLink = H`
<a
   class="px-1 text-white"
   target="_blank"
   link="external noopener"
   href="${null}"
>
   ${null}
</a>`;

const Header = H`
<header class="p-2 bg-pink-800 text-white text-sm md:text-lg shadow fixed top-0 left-0 right-0 flex z-20">
	<div class="flex-1">${InternalLink("/", "Ingrates")}</div>
	
	${InternalLink("/api.html", "API")}
	${InternalLink("/guide.html", "Guide")}
	${InternalLink("/eco.html", "Ecosystem")}
	${ExternalLink("https://github.com/FreddieGilbraith/ingrates", "Github")}
</header>

<div> <div class="h-8 md:h-10 block"></div> </div>
`;

const Footer = H`
<footer class="p-2 bg-pink-800 text-white text-sm md:text-lg shadow text-right self-stretch">
	Created and maintained by${ExternalLink("https://littlebonsai.co.uk", "little bonsai")}
</footer>
`;

const App = H`
<html>
	<head>
		<link href="/index.css" rel="stylesheet">
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>Ingrates</title>
	</head>
	<body class="flex flex-col items-stretch">
		${Header()}
		${null}
		${Footer()}
	</body>
</html>
`;

const Markdowned = H`
<div
	id="markdown-content"
	style="padding-bottom:50vh"
	class="
		max-w-2xl w-full flex-1
		p-2 self-center
		lg:pl-6 lg:self-start
		xl:pl-2 xl:self-center
	"
>
	${null}
</div>
`;

exports.App = App;
exports.Markdowned = Markdowned;
