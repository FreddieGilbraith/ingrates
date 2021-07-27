import React from "react";

function getCenterCoordsOfElement(el) {
	const { offsetLeft, offsetTop, clientHeight, clientWidth } = el;

	return [offsetLeft + clientWidth / 2, offsetTop + clientHeight / 2];
}

function calculateDistance([x1, y1], [x2, y2]) {
	console.log("calculateDistance", ...arguments);
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

export default function useKeyboardFocusManager() {
	React.useEffect(() => {
		function onKeyDown(e) {
			if (
				e.key === "ArrowDown" ||
				e.key === "ArrowUp" ||
				e.key === "ArrowLeft" ||
				e.key === "ArrowRight"
			) {
				const currentlyFocused = document.activeElement;
				const myCenter = getCenterCoordsOfElement(currentlyFocused);

				const getDistance = calculateDistance.bind(null, myCenter);
				const getDirection = calculateDirection.bind(null, myCenter);

				let minDistance = Infinity;
				let acc = null;
				for (const el of document.querySelectorAll("[data-keyboard-focusable]")) {
					if (el === currentlyFocused) {
						continue;
					}

					const theirCenter = getCenterCoordsOfElement(el);

					const direction = getDirection(theirCenter);
					if (direction === e.key.replace("Arrow", "")) {
						const distance = getDistance(theirCenter);
						if (distance < minDistance) {
							minDistance = distance;
							acc = el;
						}
					}
				}

				if (acc) {
					acc.focus();
				}
			}
			return;
		}

		document.addEventListener("keydown", onKeyDown);

		return () => document.removeEventListener("keydown", onKeyDown);
	}, []);
}
