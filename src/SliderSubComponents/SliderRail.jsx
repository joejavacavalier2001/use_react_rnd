import React from 'react';
const SliderRail = ({ getEventData, activeHandleID, getRailProps, onInsert, handleTooltipShow, handleTooltipHide }) => {
	let handleOnMouseDown = (e) => {
		e.stopPropagation();
		e.preventDefault();
		let obj = getEventData(e);
		onInsert(obj.value);
	};
	return (
		<>
		  <div className="railOuterStyle" onMouseDown={handleOnMouseDown} onMouseOver={handleTooltipShow} onMouseOut={handleTooltipHide}/> 
		  <div className="railInnerStyle" />
		</>
	);
};
export default SliderRail;
