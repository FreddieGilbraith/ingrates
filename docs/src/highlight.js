function* stringAwareSplit(input) {
	let inString = false;
	let acc = "";

	for (const char of input) {
		if (char === " " && !inString) {
			yield acc;
			acc = "";
			continue;
		}

		if (char === '"') {
			inString = !inString;
		}

		acc += char;
	}

	yield acc;

	return acc;
}

module.exports = function (code, lang) {
	if (lang === "shell") {
		return code
			.split("\n")
			.map(
				(line) =>
					`<span><span class="select-none pr-2">$</span><span>${line}</span></span>`,
			)
			.join("\n");
	}

	if (lang === "output") {
		return code
			.split("\n")
			.map((line) => {
				const formattedLine = (() => {
					if (line.startsWith("//")) {
						return `<span class="text-gray-300">${line}</span>`;
					}

					const acc = [...stringAwareSplit(line)].map((token) => {
						if (/^"?[a-zA-Z0-9]{24}"?$/.test(token)) {
							return `<span class="text-green-300">${token}</span>`;
						}
						if (token.startsWith('"')) {
							return `<span class="text-yellow-300">${token}</span>`;
						}
						return `<span class="text-blue-300">${token}</span>`;
					});

					return acc.join(" ");
				})();

				return `<span><span class="select-none pr-2">></span>${formattedLine}</span>`;
			})
			.join("\n");
	}

	if (lang === "javascript") {
		function col(className) {
			return function doCol(match, capture) {
				return match.replace(
					capture,
					`<span class="${className}">${capture}</span>`,
				);
			};
		}

		return code
			.replace(/(".+")/g, col("text-yellow-300"))

			.replace(/(\/\/.*\n)/g, col("text-gray-300"))
			.replace(/(console)/g, col("text-purple-300"))
			.replace(/(const|case)/g, col("text-yellow-500"))
			.replace(/(function\*?)/g, col("text-blue-300"))
			.replace(
				/[^a-zA-Z]([A-Z][a-zA-Z]+Actor)[^a-zA-Z]/g,
				col("text-green-400"),
			)
			.replace(/\s([A-Z][a-zA-Z]*)\(/g, col("text-purple-200"))
			.replace(/\s([a-z][a-zA-Z]*)\(/g, col("text-green-200"))
			.replace(
				/(import|from|async|await|yield|while|for|if|else|return|switch|=>)/g,
				col("text-red-500"),
			);
	}

	return ``;
};
