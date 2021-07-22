import React from "react";

export default function Wrapper({ title, children }) {
	return (
		<React.Fragment>
			<div className="absolute inset-2 border-2 rounded border-black shadow-inner" />
			<div className="absolute inset-2 flex flex-col items-center p-2">
				<h1 className="text-xl font-bold">{title}</h1>
				<div className="flex-1 flex flex-col items-center justify-center">{children}</div>
			</div>
		</React.Fragment>
	);
}
