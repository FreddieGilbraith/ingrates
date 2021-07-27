import React from "react";

function getCenterCoordsOfElement(el){
const { offsetLeft, offsetTop, clientHeight, clientWidth } = el;

return [ offsetLeft + (clientWidth / 2),
offsetTop + (clientHeight / 2)];
	}

export default function useKeyboardFocusManager(){

	React.useEffect( () => {
		function onKeyDown(e){
if(
e.key === "ArrowDown" || 
e.key === "ArrowUp" || 
e.key === "ArrowLeft" || 
e.key === "ArrowRight"){
	const currentlyFocused = (document.activeElement)
const myCenter = getCenterCoordsOfElement(currentlyFocused);

for(const el of document.querySelectorAll("[data-keyboard-focusable]")){
if(el === currentlyFocused){
	continue;
	} 

console.log(getCenterCoordsOfElement(el));

}

	}
return;

			}

			document.addEventListener("keydown", onKeyDown);

			return () => document.removeEventListener("keydown", onKeyDown);
	}, []);
}
