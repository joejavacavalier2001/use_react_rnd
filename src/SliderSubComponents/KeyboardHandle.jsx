import React from 'react';
const KeyboardHandle = ({domain, handle, disabled, getHandleProps}) => {
	let {min, max} = domain;
	let { id, value, percent } = handle;
	let dynamicStyle = {
		left: `${percent}%`,
        backgroundColor: disabled ? "#666" : "#ffc400"
	};
	return (
		  <button className="keyboardHandleStaticStyle" style={dynamicStyle} 
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
			{...getHandleProps(id)} 
		  />
	);
};
export default KeyboardHandle;
