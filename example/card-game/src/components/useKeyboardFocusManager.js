import React from "react";

function getCenterCoordsOfElement(el) {
	const { offsetLeft, offsetTop, clientHeight, clientWidth } = el;

	return [offsetLeft + clientWidth / 2, offsetTop + clientHeight / 2];
}

function getCornerCoordsOfElement(el) {
	const { offsetLeft, offsetTop, clientHeight, clientWidth } = el;

	return [
		[offsetLeft + clientWidth * 0, offsetTop + clientHeight * 0],
		[offsetLeft + clientWidth * 0, offsetTop + clientHeight * 1],
		[offsetLeft + clientWidth * 1, offsetTop + clientHeight * 0],
		[offsetLeft + clientWidth * 1, offsetTop + clientHeight * 1],
		[offsetLeft + clientWidth / 2, offsetTop + clientHeight / 2],
	];
}

function calculatePointDistance([x1, y1], [x2, y2]) {
	return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function calculateDirection([x1, y1], [x2, y2]) {
	const xDelta = x2 - x1;
	const yDelta = y2 - y1;

	if (Math.abs(xDelta) > Math.abs(yDelta)) {
		if (xDelta < 0) {
			return "Left";
		} else {
			return "Right";
		}
	}

	if (yDelta < 0) {
		return "Up";
	} else {
		return "Down";
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

				const start = getCenterCoordsOfElement(currentlyFocused);

				let minDistance = Infinity;
				let elToFocus = null;

				for (const el of document.querySelectorAll("[data-keyboard-focusable]")) {
					if (el === currentlyFocused) {
						continue;
					}

					for (const corner2 of getCornerCoordsOfElement(el)) {
						const direction = calculateDirection(start, corner2);
						if (direction === e.key.replace("Arrow", "")) {
							const distance = calculatePointDistance(start, corner2);
							if (distance < minDistance) {
								minDistance = distance;
								elToFocus = el;
							}
						}
					}
				}

				if (elToFocus) {
					elToFocus.focus();
				}
			}
			return;
		}

		document.addEventListener("keydown", onKeyDown);

		return () => document.removeEventListener("keydown", onKeyDown);
	}, []);
}
