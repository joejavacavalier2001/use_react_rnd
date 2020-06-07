import React, {useMemo, useCallback} from 'react';
import {Slider, Rail, Handles, Tracks, Ticks} from "react-compound-slider";
import {Handle, SliderRail, Tick, Track} from "./SliderSubComponents/CombinedExports";
import {setGestureTimes} from "./actions/gestureActions";
import {connect} from "react-redux";
import {gestureList2,playbackDuration,currentGestureIndex} from "./selectors";
import {addGesture} from "./actions/gestureActions";

const GestureTimeSlider = (props) => {
  const sliderStyle = {
    position: "relative",
    width: "95%",
	margin: "1.25em"
  };

  // PLEASE DON'T RENDER THIS COMPONENT UNLESS THE MEDIA FILE IS LOADED AND WE KNOW THE VALUE OF playbackDuration

  const newStep = useMemo(() => {return +(1/(Math.pow(10,props.decimalPlaces)).toFixed(props.decimalPlaces));},[props]);
  const domain = useMemo(() => {return [0, props.playbackDuration];},[props]);
  const defaultValues = useMemo(() => { 
	  var output = [].concat(...props.gestureTimes);
	  output = output.map(element => (element === Infinity) ? domain[1] : element);
	  return output;
  },[props,domain]);

  const handleOnChange = useCallback((e) => {
	  let newGestureTimes = [];
	  let tempArray = e.map(element => +(element.toFixed(props.decimalPlaces)));
	  while (tempArray.length > 0)
		  newGestureTimes.push(tempArray.splice(0,2));

	  props.setGestureTimes(newGestureTimes);
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
          <Tracks left={false} right={false}>
            {({ tracks, getTrackProps }) => (
              <div className="slider-tracks">
                {tracks.map(({ id, source, target },tIndex) => {
                  return (!(tIndex % 2)) ? 
                  (<Track 
                    key={id}
                    source={source}
                    target={target}
                    tIndex={Math.floor(tIndex/2) + 1}
					currentTrack={props.currentIndex}
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
    gestureTimes: gestureList2(state),//state.currentGesture.gestureList2,
	playbackDuration: playbackDuration(state),//state.currentGesture.playbackDuration,
    currentIndex: currentGestureIndex(state) //state.currentGesture.currentGestureIndex, 
  };
};
const mapDispatchToProps = (dispatch) => {
    return {
      setGestureTimes: (newGestureTimes) => {
        dispatch(setGestureTimes(newGestureTimes));
      },
	  addGesture: (newValueInRange, step) => {
		dispatch(addGesture(newValueInRange,step));
	  }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(GestureTimeSlider);