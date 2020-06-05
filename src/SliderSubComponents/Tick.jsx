import React from 'react';
const Tick = ({tick, count, format}) => {
	let dynamicStyle1 = {
        backgroundColor: "rgb(200,200,200)",
        left: `${tick.percent}%`
	};
	let dynamicStyle2 = {
        marginLeft: `${-(100 / count) / 2}%`,
        width: `${100 / count}%`,
        left: `${tick.percent}%`
	};
	return (
			<>
				<div className="tickStaticStyle1" style={dynamicStyle1} />
				<div className="tickStaticStyle2" style={dynamicStyle2} >{tick.value}</div>
			</>
	);
};
export default Tick;
