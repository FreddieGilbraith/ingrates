export default (prefix) => (prov) => {
	const { self } = prov;

	return {
		log: (...args) => {
			console.log(prefix, self, prov.name, ...args);
		},
	};
};
