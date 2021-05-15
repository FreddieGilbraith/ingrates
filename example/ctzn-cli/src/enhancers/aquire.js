export default ({ children, spawn }) => {
	function doAquire(nickname, ActorDefinition, ...args) {
		if (children[nickname]) {
			return children[nickname];
		} else {
			return spawn[nickname](ActorDefinition, ...args);
		}
	}

	const aquire = new Proxy(
		{},
		{
			get: (_, nickname, __) => doAquire.bind(null, nickname),
		},
	);

	return { aquire };
};
