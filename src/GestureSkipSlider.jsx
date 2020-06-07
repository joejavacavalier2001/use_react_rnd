import React, {useMemo, useCallback} from 'react';
import {Slider, Rail, Handles, Tracks, Ticks} from "react-compound-slider";
import {Handle, SliderRail, Tick, Track} from "./SliderSubComponents/CombinedExports";
import {connect} from "react-redux";
import {playbackDuration, playbackJumpTime} from "./selectors";
import {setSkipTime} from "./actions/gestureActions.js";

const GestureSkipSlider = (props) => {
  const sliderStyle = {
    position: "relative",
    width: "95%",
	margin: "1.25em"
  };

  // PLEASE DON'T RENDER THIS COMPONENT UNLESS THE MEDIA FILE IS LOADED AND WE KNOW THE VALUE OF playbackDuration

  const newStep = useMemo(() => {return +(1/(Math.pow(10,props.decimalPlaces)).toFixed(props.decimalPlaces));},[props]);
  const domain = useMemo(() => {return [0, props.playbackDuration];},[props]);
  const defaultValues = useMemo(() => {return [props.playbackJumpTime];},[props]); 

  const handleOnChange = useCallback((e) => {
	  console.log("Inside handleOnChange, e: " + e.toString());
	  props.setSkipTime(+(e[0].toFixed(props.decimalPlaces)));
  },[props]);

  const handleOnInsert = useCallback((rawValue) => {
	  props.addGesture(rawValue.toFixed(props.decimalPlaces),newStep);
  },[props,newStep]);

  return (
	  <div className="GestureTimeSliderStaticStyle">
		<Slider
          mode={3}
          step={newStep}
          domain={domain}
          rootStyle={sliderStyle}
          onChange={handleOnChange}
          values={defaultValues}
        >
          <Rail>
            {({ getEventData, activeHandleID, getRailProps }) => <SliderRail getEventData={getEventData} activeHandleID={activeHandleID} getRailProps={getRailProps} onInsert={handleOnInsert} />}
          </Rail>
          <Handles>
            {({ handles, getHandleProps }) => (
              <div className="slider-handles">
                {handles.map(handle => (
                  <Handle
                    key={handle.id}
                    handle={handle}
                    domain={domain}
					decimalPlaces={props.decimalPlaces}
                    getHandleProps={getHandleProps}
                  />
                ))}
              </div>
            )}
          </Handles>
          <Tracks right={false}>
            {({ tracks, getTrackProps }) => (
              <div className="slider-tracks">
                {tracks.map(({ id, source, target },tIndex) => {
                  return (!(tIndex % 2)) ? 
                  (<Track 
                    key={id}
                    source={source}
                    target={target}
                    tIndex={Math.floor(tIndex/2) + 1}
					currentTrack={0}
                    getTrackProps={getTrackProps}
                  />) : null;
                  })}
              </div>
            )}
          </Tracks>
          <Ticks count={9}>
            {({ ticks }) => (
              <div className="slider-ticks">
                {ticks.map(tick => (
                  <Tick key={tick.id} tick={tick} count={ticks.length} />
                ))}
              </div>
            )}
          </Ticks>
        </Slider>
	  </div>
  );
};

const mapStateToProps = (state) => {
  return {
	playbackDuration: playbackDuration(state),//state.currentGesture.playbackDuration,
	playbackJumpTime: playbackJumpTime(state)
  };
};
const mapDispatchToProps = (dispatch) => {
    return {
      setSkipTime: (newSkipTime) => {
        dispatch(setSkipTime(newSkipTime));
      }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(GestureSkipSlider);
