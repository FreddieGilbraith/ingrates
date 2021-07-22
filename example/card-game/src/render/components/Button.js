import React from "react";
import cn from "classnames";

export default function Button({ color, move, as = "button", className, ...props }) {
	const Component = as;
	return (
		<Component
			className={cn(
				className,
				"bold",
				"px-6",
				"py-3",
				"rounded",
				"shadow",
				"text-3xl",
				"text-white",
				"cursor-pointer",

				"transition-all",
				"transform",

				"border-2",

				"hover:shadow-2xl",

				{
					"hover:-translate-y-1": move === "up",
					"hover:translate-y-1": move === "down",
				},
				{
					"bg-green-700 border-green-800 hover:bg-green-600 hover:text-green-100 hover:border-green-500":
						color === "green",
					"bg-blue-700 border-blue-800 hover:bg-blue-600 hover:text-blue-100 hover:border-blue-500":
						color === "blue",
					"bg-red-700 border-red-800 hover:bg-red-600 hover:text-red-100 hover:border-red-500":
						color === "red",
				},
			)}
			{...props}
		/>
	);
}
