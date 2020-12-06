import React, {useMemo} from 'react';
import {connect} from "react-redux";
import { Rnd } from "react-rnd";
import {playbackGestures,playbackIsPlaying} from "./selectors";

const GestureRuntimeGroup = (props) => {
	const disableResizing = {
	  bottom: false,
	  bottomLeft: false,
	  bottomRight: false,
	  left: false,
	  right: false,
	  top: false,
	  topLeft: false,
	  topRight: false
	};

	let runtimeGestures = useMemo(() => {
		return props.playbackGestures.map((gestureObj) => {
			let gestureTime = gestureObj.startTime + "_playback";
			let defaultObj = {x: gestureObj.location[0], y: gestureObj.location[1], width: gestureObj.dimensions[0], height: gestureObj.dimensions[1]};
			return (<Rnd default={defaultObj} enableResizing={disableResizing} disableDragging={true} key={gestureTime} />);
		});
	},[props.playbackGestures, disableResizing]);

	return (<> {runtimeGestures} </>);
}; // end GesturePlayback

const mapStateToProps = (state) => {
	let showGestures = (playbackIsPlaying(state) ? playbackGestures(state) : []);
	return {
  		playbackGestures: showGestures 
	}
};
export default connect(mapStateToProps)(GestureRuntimeGroup);
