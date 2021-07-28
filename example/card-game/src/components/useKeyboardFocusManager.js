import React from "react";

function getCenterCoordsOfElement(el) {
	const { offsetLeft, offsetTop, clientHeight, clientWidth } = el;

	return [offsetLeft + clientWidth / 2, offsetTop + clientHeight / 2];
}

function calculatePointDistance([x1, y1], [x2, y2]) {
	return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function calculatePointTheta([x1, y1], [x2, y2]) {
	return Math.atan2(y2 - y1, x2 - x1);
}

function calculateSquareDistance(el1, el2) {
	const c1 = getCenterCoordsOfElement(el1);
	const c2 = getCenterCoordsOfElement(el2);

	const theta = calculatePointTheta(c1, c2);

	if ((Math.PI * 3) / 4 <= theta && theta <= (Math.PI * 1) / 4) {
		//Up
		return el2.offsetTop + el2.clientHeight - el1.offsetTop;
	}

	if ((Math.PI * 1) / 4 <= theta && theta <= (-Math.PI * 1) / 4) {
		//Left
		return el2.offsetLeft + el2.clientWidth - el1.offsetLeft;
	}

	if ((-Math.PI * 1) / 4 <= theta && theta <= (-Math.PI * 3) / 4) {
		//Down
		return el2.offsetTop - (el1.offsetTop + el1.clientHeight);
	}

	//Right
	return el2.offsetLeft - (el1.offsetLeft + el1.clientWidth);
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

				const getSquareDistance = calculateSquareDistance.bind(null, currentlyFocused);
				const getDirection = calculateDirection.bind(null, myCenter);

				let minDistance = Infinity;
				let acc = null;
				for (const el of document.querySelectorAll("[data-keyboard-focusable]")) {
					if (el === currentlyFocused) {
						continue;
					}

					const theirCenter = getCenterCoordsOfElement(el);

					const direction = getDirection(theirCenter);

					console.log(el.textContent, direction);

					if (direction === e.key.replace("Arrow", "")) {
						const distance = getSquareDistance(el);

						console.log(el.textContent, distance);

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
