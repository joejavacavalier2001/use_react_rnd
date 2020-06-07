import React, {useCallback, useRef, useEffect} from 'react';
import {initializePlaybackState, updatePlaybackState, updateMediaDuration, setPlaybackState} from "./actions/gestureActions";
import {connect} from "react-redux";
import ReactCustomReplayButton from "./ReactCustomReplayButton";
import ReactCustomStopButton from "./ReactCustomStopButton";
import GestureSliderParent from "./GestureSliderParent";
import { Media, Player, controls } from 'react-media-player';
import { playbackJumpTime } from "./selectors"; 

const {CurrentTime} = controls;

const ReactMediaWrapper = (props) => {

	let ref = useRef(null);
	let handleOnTimeUpdate = useCallback((e) => {
		props.updatePlaybackState(e.currentTime);
	},[props]);

	// I hate this technique.
	// It's only slightly better then busy waiting, 
	// but I desperately need the duration data after loading.
	// https://en.wikipedia.org/wiki/Busy_waiting
	let handleOnLoad = useCallback(() => {
		if ((!ref.current) || (ref.current.context.media.isLoading))
			setTimeout(handleOnLoad,100);
		else 
			props.updateMediaDuration(ref.current.context.media.duration);
	},[props,ref]);
	

	useEffect(() => {
		handleOnLoad();
	},[ref, handleOnLoad]);
    return (
      <Media>
		<>
			<Player ref={ref} src={window.myfile} onTimeUpdate={handleOnTimeUpdate} />
			<GestureSliderParent isSkipSlider={true} decimalPlaces={2} />
			<ReactCustomReplayButton setPlayingState={props.setPlaybackState} playbackJumpTime={props.playbackJumpTime} />
			<ReactCustomStopButton setPlayingState={props.setPlaybackState}/>
			<CurrentTime />
		</>
  	  </Media>
    );
};
const mapStateToProps = (state) => {
  return {
    playbackJumpTime: playbackJumpTime(state)
  };
};

const mapDispatchToProps = (dispatch) => {
    return {
	  updatePlaybackState: (currentMediaTime) => {
		dispatch(updatePlaybackState(currentMediaTime));
	  },
	  updateMediaDuration: (newDuration) => {
		dispatch(updateMediaDuration(newDuration));
	  },
	  setPlaybackState: (newValue) => {
		if (newValue)
		  dispatch(initializePlaybackState());
		dispatch(setPlaybackState(newValue));
	  }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(ReactMediaWrapper);

