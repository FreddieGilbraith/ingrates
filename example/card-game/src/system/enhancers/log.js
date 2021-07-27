export default function createLogEnahcner(prefix) {
	return (prov) => {
		const { self } = prov;

		return {
			log: (...args) => {
				console.log(prefix, self, prov.name, ...args);
			},
		};
	};
}
