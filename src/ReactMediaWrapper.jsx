import React, {useState, useCallback, useRef, useEffect} from 'react';
import {initializePlaybackState, updatePlaybackState, updateMediaDuration, setPlaybackState} from "./actions/gestureActions";
import {connect} from "react-redux";
import { playbackJumpTime,playbackIsPlaying,skipTimeInfo } from "./selectors"; 
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import GestureSliderParent from "./GestureSliderParent";
import GestureSkipPicker from "./GestureSkipPicker";

const ReactMediaWrapper = (props) => {

	let audioref = useRef(null);
    
	// I hate this technique.
    // It's only slightly better then busy waiting,
    // but I desperately need the duration data after loading.
    // https://en.wikipedia.org/wiki/Busy_waiting
    let handleOnLoad = useCallback(() => {
        if ((!audioref.current) || (isNaN(audioref.current.duration))){
            setTimeout(handleOnLoad,100);
        } else {
            props.updateMediaDuration(audioref.current.duration);
        }
    },[props,audioref]);

    useEffect(() => {
        handleOnLoad();
    },[handleOnLoad]);

	useEffect(() => {
		if ((audioref.current) && (props.skipTimeInfo.shouldSkip)){
			audioref.current.currentTime = props.skipTimeInfo.skipTime;
		}
	},[props.skipTimeInfo]);

	let [displayTime, setDisplayTime] = useState(0);

	let handleOnTimeUpdate = useCallback((event) => {
		props.updatePlaybackState(event.currentTarget.currentTime);
		setDisplayTime(event.currentTarget.currentTime.toFixed(2));
	},[props,setDisplayTime]);

	let handleRestartClick = useCallback((event) => {
		event.currentTarget.blur();
		audioref.current.currentTime = 0;
		audioref.current.play();
		props.setPlaybackState(true);
	},[props]);

	let handleStopClick = useCallback((event) => {
		event.currentTarget.blur();
		audioref.current.pause();
		props.setPlaybackState(false);
	},[props]);

    return (
		<Container fluid id="media-container">
			<Row><Col><audio src={window.myfile} ref={audioref} controls={false} autoPlay={false} onTimeUpdate={handleOnTimeUpdate} /></Col></Row>
			<Row><Col><GestureSkipPicker /> </Col></Row>
			<Row><Col><GestureSliderParent isSkipSlider={true} decimalPlaces={2} /></Col></Row>
			{((props.playbackIsPlaying) &&
			(<Row>
				<Col><p>Current time: {displayTime} seconds</p></Col>
			</Row>))}
			<Row>
				<Col md="auto"><Button variant="primary" onClick={handleRestartClick}>Restart</Button></Col>
				{((props.playbackIsPlaying) && (<Col md="auto"><Button variant="primary" onClick={handleStopClick}>Stop</Button></Col>))}
			</Row>
		</Container>
    );
};
const mapStateToProps = (state) => {
  return {
    playbackJumpTime: playbackJumpTime(state),
	playbackIsPlaying: playbackIsPlaying(state),
	skipTimeInfo: skipTimeInfo(state)
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

