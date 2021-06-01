class IngratesAssertionError extends Error {
	constructor(logMessage, name, self) {
		super([name, self, logMessage].join("\t"));

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, IngratesAssertionError);
		}

		this.name = "IngratesAssertionError";
		// Custom debugging information
		this.name = name;
		this.self = self;
	}
}

export default function assertEnhancer({ name, self }) {
	function assert(condition, logMessage) {
		if (!condition) {
			throw new IngratesAssertionError(logMessage, name, self);
		}
	}

	assert.equal = function assertEqual(lhs, rhs, logMessage) {
		return assert(lhs === rhs, `${logMessage} (${lhs} !== ${rhs})`);
	};

	return {
		assert,
	};
}
