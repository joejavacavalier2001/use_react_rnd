import React, {useState, useCallback}  from 'react';

const Handle = ({domain, handle, disabled, decimalPlaces, getHandleProps}) => {
	let {min, max} = domain;
	let { id, value, percent } = handle;
	let dynamicStyle = {left: `${percent}%`};
	let backgroundColor = {backgroundColor: disabled ? "#666" : "#ffc400"};
	let dynamicSliderRoleStyle = {...dynamicStyle, ...backgroundColor};
	let [shouldShowTooltip, setShow] = useState(false);
	let handleMouseOver = useCallback(() => {setShow(true);},[setShow]);
	let handleMouseOut = useCallback(() => {setShow(false);},[setShow]);

	return (
		<>
		  <div className="handleStaticStyle" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut} style={dynamicStyle} {...getHandleProps(id)} />
		  <div className="divSliderRoleStaticStyle" 
		    style={dynamicSliderRoleStyle} 
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
		  >
			{(shouldShowTooltip) && (<div className="SliderHandleTooltip">{value.toFixed(decimalPlaces)} sec</div>)}
		  </div>
		</>
	);
};
export default Handle;
