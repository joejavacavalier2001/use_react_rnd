import React from 'react';
import {connect} from "react-redux";
import GestureTimeSlider from "./GestureTimeSlider";
import {combinedPlaybackStatus} from "./selectors";

const GestureEditLayerParent = (props) => {
  return (
	  	<>
	  		{(!props.playbackDuration) ? (<h3>Still loading media file...</h3>) : 
				((props.playbackIsPlaying) ? (<h3>Cannot edit gesture times during playback</h3>) : (<GestureTimeSlider decimalPlaces={props.decimalPlaces} />))} 
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
export default connect(mapStateToProps)(GestureEditLayerParent);
