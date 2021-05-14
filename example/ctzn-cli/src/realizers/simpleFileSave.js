export default function ingratesRealizerFileSave({ runActor, doKill }) {
	return {
		dispatch: console.log.bind(null, "ingratesRealizerFileSave.dispatch"),
		kill: console.log.bind(null, "ingratesRealizerFileSave.kill"),
		spawn: console.log.bind(null, "ingratesRealizerFileSave.spawn"),
	};
}
