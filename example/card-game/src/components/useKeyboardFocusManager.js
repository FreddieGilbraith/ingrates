import React from "react";
import * as R from "ramda";
import * as I from "iter-tools";

function getCenterCoordsOfElement(el) {
	const { offsetLeft, offsetTop, clientHeight, clientWidth } = el;

	return [offsetLeft + clientWidth / 2, offsetTop + clientHeight / 2];
}

function calculatePointDistance([x1, y1], [x2, y2]) {
	return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function calculatePointDelta([x1, y1], [x2, y2]) {
	return [x2 - x1, y2 - y1];
}

function calculateCardinalDiviance(cardinalHalf, [x, y]) {
	switch (cardinalHalf) {
		case "Up":
			return (Math.cos(x / y) + 1) / 2;
		case "Down":
			return (Math.cos(x / y) + 1) / 2;
		case "Left":
			return (Math.cos(y / x) + 1) / 2;
		case "Right":
			return (Math.cos(y / x) + 1) / 2;
		default:
			throw new Error(cardinalHalf);
	}
}

function isPointInCardinalHalf(cardinalHalf, [x, y]) {
	switch (cardinalHalf) {
		case "Up":
			return y < 0;
		case "Down":
			return y > 0;
		case "Left":
			return x < 0;
		case "Right":
			return x > 0;
		default:
			throw new Error(cardinalHalf);
	}
}

function* getAllFocusableDestinations() {
	const currentlyFocused = document.activeElement;

	for (const el of document.querySelectorAll("[data-keyboard-focusable]")) {
		if (el === currentlyFocused) {
			continue;
		}

		yield el;
	}
}

function youGottaFocusOnSOMETHING() {
	const currentlyFocused = document.activeElement;

	if (!currentlyFocused.dataset.keyboardFocusable) {
		if (document.querySelector("[data-keyboard-focusable=entry]")) {
			return document.querySelector("[data-keyboard-focusable=entry]").focus();
		}

		if (document.querySelector("[data-keyboard-focusable]")) {
			return document.querySelector("[data-keyboard-focusable]").focus();
		}
	}
}

export default function useKeyboardFocusManager() {
	React.useLayoutEffect(() => {
		youGottaFocusOnSOMETHING();
	});

	React.useEffect(() => {
		function onKeyDown(e) {
			try {
				if (e.key === "Escape") {
					if (document.querySelector("[data-keyboard-focusable=esc]")) {
						document.querySelector("[data-keyboard-focusable=esc]").focus();
					}
				}

				if (
					e.key === "ArrowDown" ||
					e.key === "ArrowUp" ||
					e.key === "ArrowLeft" ||
					e.key === "ArrowRight"
				) {
					youGottaFocusOnSOMETHING();

					const currentlyFocused = document.activeElement;

					const startCenter = getCenterCoordsOfElement(currentlyFocused);
					const cardinalHalf = e.key.replace("Arrow", "");

					const elToFocus = I.pipe(
						I.map((el) => ({
							el,
							label: el.textContent,
							center: getCenterCoordsOfElement(el),
						})),

						I.filter(({ center: endCenter }) =>
							isPointInCardinalHalf(
								cardinalHalf,
								calculatePointDelta(startCenter, endCenter),
							),
						),

						I.map(({ center: endCenter, ...rest }) => ({
							...rest,
							center: endCenter,
							euclidDistance: calculatePointDistance(startCenter, endCenter),
						})),

						I.map(({ center: endCenter, ...rest }) => ({
							...rest,
							center: endCenter,
							cardinalDeviance: calculateCardinalDiviance(
								cardinalHalf,
								calculatePointDelta(startCenter, endCenter),
							),
						})),

						I.map(({ euclidDistance, cardinalDeviance, ...rest }) => ({
							...rest,
							euclidDistance,
							cardinalDeviance,
							distanceCoeficient: Math.pow(cardinalDeviance, 2) / euclidDistance,
						})),

						I.reduce({ el: null, distanceCoeficient: 0 }, (acc, val) =>
							val.distanceCoeficient > acc.distanceCoeficient ? val : acc,
						),
					)(getAllFocusableDestinations());

					if (elToFocus.el) {
						elToFocus.el.focus();
					}
				}
			} catch (e) {
				console.error(e);
			}
			return;
		}

		document.addEventListener("keydown", onKeyDown);

		return () => document.removeEventListener("keydown", onKeyDown);
	}, []);
}
