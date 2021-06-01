import React, {Suspense} from 'react';
import {connect} from "react-redux";
import {combinedPlaybackStatus} from "./selectors";
import GestureTimeSlider from "./GestureTimeSlider"; 
import GestureSkipSlider from "./GestureSkipSlider"; 
/*
const GestureTimeSlider = React.lazy(() => import("./GestureTimeSlider")); 
const GestureSkipSlider = React.lazy(() => import("./GestureSkipSlider")); 
*/
const GestureSliderParent = ({isSkipSlider = false, ...props}) => {
  let headerStr = (isSkipSlider ? "Skip " : "Gesture Time ");
  headerStr += "Slider:";
  return (
	  	<>
	  		{(props.playbackDuration === 0) ? (<h3>Still loading media file...</h3>) : 
				((props.playbackIsPlaying) ? (<h3>Cannot edit gesture or skip times during playback</h3>) : 
							<>
							<h4>{headerStr}</h4>
							{(isSkipSlider) ?
							(<GestureSkipSlider decimalPlaces={props.decimalPlaces} />) :
							(<GestureTimeSlider decimalPlaces={props.decimalPlaces} />)}
							</>
				)} 
	  	</>
  );
}
const mapStateToProps = (state) => {
  let combinedStatus = combinedPlaybackStatus(state);
  return {
	  playbackIsPlaying: combinedStatus.playbackIsPlaying, //state.currentGesture.playbackIsPlaying,
	  playbackDuration: combinedStatus.playbackDuration //state.currentGesture.playbackDuration
  };
};
export default connect(mapStateToProps)(GestureSliderParent);
