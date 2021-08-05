import React from "react";
import cn from "classnames";
import { nanoid } from "nanoid";

const widths = ["w-4", "w-6", "w-8", "w-16", "w-20", "w-24", "w-28", "w-32"];
const heights = ["h-4", "h-6", "h-8", "h-16", "h-20", "h-24", "h-28", "h-32"];
const margins = ["m-4", "m-6", "m-8", "m-16", "m-32"];

function randomFromXs(xs) {
	return xs[Math.floor(Math.random() * xs.length)];
}

function SemiStaticBox() {
	const [className] = React.useState(
		cn(randomFromXs(widths), randomFromXs(heights), randomFromXs(margins)),
	);

	const [style] = React.useState({
		top: `${Math.random() * 90}%`,
		left: `${Math.random() * 90}%`,
	});

	const [children] = React.useState(nanoid(4));

	return (
		<button
			data-keyboard-focusable
			className={cn(className, "bg-blue-300", "focus:bg-green-500", "absolute")}
			style={style}
		>
			{children}
		</button>
	);
}

export default function Playground() {
	console.log("Playground");
	return (
		<div className="flex-1 flex items-stretch justify-evenly relative">
			{new Array(16).fill(null).map((_, i) => (
				<SemiStaticBox key={i} />
			))}
		</div>
	);
}
