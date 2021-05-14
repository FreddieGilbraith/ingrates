export default (prefix) => (prov) => {
	const { self } = prov;

	return {
		log: (...args) => {
			console.log(
				prefix,
				self,
				new Error().stack
					.split("\n")[2]
					.replace(/^\s*at /, "")
					.replace(/\s+.*/, ""),

				...args,
			);
		},
	};
};
