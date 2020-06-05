import React from 'react';
const SliderRail = ({ getEventData, activeHandleID, getRailProps, onInsert }) => {
	let handleOnMouseDown = (e) => {
		e.stopPropagation();
		e.preventDefault();
		let obj = getEventData(e);
		onInsert(obj.value);
	};
	return (
		<>
		  <div className="railOuterStyle" onMouseDown={handleOnMouseDown} /> 
		  <div className="railInnerStyle" />
		</>
	);
};
export default SliderRail;
