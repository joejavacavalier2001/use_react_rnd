import React from 'react';
const Track = ({source, target, tIndex, currentTrack, getTrackProps, disabled}) => {
	let dynamicStyle = {
		backgroundColor: disabled ? "#999" : ((--tIndex === currentTrack) ? "#b2002a" : "#007fb5"),
        left: `${source.percent}%`,
        width: `${target.percent - source.percent}%`
	};
	return (<div className="trackStaticStyle" style={dynamicStyle} {...getTrackProps()} />);
};
export default Track;
