module.exports = {
	purge: {
		enabled: true,
		content: [
			"./docs/src/**/*.html",
			"./docs/src/**/*.css",
			"./docs/src/**/*.js",
		],
	},
	darkMode: false, // or 'media' or 'class'
	theme: {
		extend: {},
	},
	variants: {
		extend: {},
	},
	plugins: [],
};
