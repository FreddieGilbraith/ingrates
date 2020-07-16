describe("shutdown", () => {
	it.todo("should terminate stateless actors once they respond to one msg");

	it.todo(
		"should not terminate stateful actors if they have a timeout but it has not elapsed",
	);
	it.todo(
		"should terminate stateful actors if they return the `terminate` symbol",
	);
	it.todo(
		"should terminate stateful actors if they have a timeout that has elapsed",
	);
	it.todo("should terminate child actors if their parents terminate");

	it.todo("should tell actors if their friends have terminated");
	it.todo("should tell parent actors that their children are terminated");
});
