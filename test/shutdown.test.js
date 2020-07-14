describe("shutdown", () => {
	it("should terminate stateless actors once they respond to one msg", () => {});

	it("should not terminate stateful actors if they have a timeout but it has not elapsed", () => {});
	it("should terminate stateful actors if they return the `terminate` symbol", () => {});
	it("should terminate stateful actors if they have a timeout that has elapsed", () => {});
	it("should terminate child actors if their parents terminate", () => {});

	it("should tell actors if their friends have terminated", () => {});
	it("should tell parent actors that their children are terminated", () => {});
});
