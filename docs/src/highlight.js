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
			.map(
				(line) =>
					`<span><span class="select-none pr-2">></span><span>${line}</span></span>`,
			)
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

			.replace(/(console)/g, col("text-purple-300"))
			.replace(/(const|case)/g, col("text-yellow-500"))
			.replace(/(function\*?)/g, col("text-blue-300"))
			.replace(/([A-Z][a-zA-Z]+Actor)/g, col("text-green-400"))
			.replace(/([a-z][a-zA-Z]*)\(/g, col("text-green-200"))
			.replace(
				/(yield|while|for|if|else|return|switch|=>)/g,
				col("text-red-500"),
			);
	}

	return `some ${lang} here`;
};
