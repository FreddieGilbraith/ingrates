module.exports = function H(statics, ...args) {
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
};
