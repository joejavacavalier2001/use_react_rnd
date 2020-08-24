import React, {useState, useMemo, useCallback} from 'react';
import {Slider, Rail, Handles, Tracks, Ticks} from "react-compound-slider";
import {Handle, SliderRail, Tick, Track} from "./SliderSubComponents/CombinedExports";
import {connect} from "react-redux";
import {playbackDuration, currentSkipIndex, skipRanges} from "./selectors";
import {setSkipRangeTimes,addSkipRange} from "./actions/gestureActions.js";

const GestureSkipSlider = (props) => {
  const sliderStyle = {
    position: "relative",
    width: "95%",
	margin: "1.25em"
  };

  // PLEASE DON'T RENDER THIS COMPONENT UNLESS THE MEDIA FILE IS LOADED AND WE KNOW THE VALUE OF playbackDuration

  const newStep = useMemo(() => {return +(1/(Math.pow(10,props.decimalPlaces)).toFixed(props.decimalPlaces));},[props]);
  const domain = useMemo(() => {return [0, props.playbackDuration];},[props]);
  //const [defaultValues,setValues] = useState([]); 
  const defaultValues = useMemo(() => { 
	  var output = [].concat(...props.skipRanges);
	  return output;
  },[props]);

  const handleOnChange = useCallback((e) => {
	  let newSkipRangeTimes = [];
	  let tempArray = e.map(element => +(element.toFixed(props.decimalPlaces)));
	  while (tempArray.length > 0)
		  newSkipRangeTimes.push(tempArray.splice(0,2));

	  props.setSkipRangeTimes(newSkipRangeTimes);
  },[props]);

  const handleOnGrayClick = useCallback((rawValue) => {
	  props.addSkipRange(rawValue.toFixed(props.decimalPlaces),newStep);
  },[props,newStep]);

  let [shouldShowTooltip, setShow] = useState(false);
  let handleMouseOver = useCallback((event) => {
	  if (event.currentTarget === event.target)
	  	setShow(true);

	  event.stopPropagation();
  }
  ,[setShow]);
  let handleMouseOut = useCallback((event) => {
	  if (event.currentTarget === event.target)
	  	setShow(false);

	  event.stopPropagation();
  }
  ,[setShow]);
  return (
	  <div className="GestureTimeSliderStaticStyle" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
	  {
		  (shouldShowTooltip) && 
		  (
			<div className="SliderTooltip">
			  <p>Instructions: Please click on the gray bar in the slider to add</p>
			  <p>scheduled ranges of time where the audio file will be skipped</p>
			  <p>You can use the slider handles to change the start and stop time of each skip range.</p>
			</div>
		  )
	  }

		<Slider
          mode={3}
          step={newStep}
          domain={domain}
          rootStyle={sliderStyle}
          onChange={handleOnChange}
          values={defaultValues}
        >
          <Rail>
            {({ getEventData, activeHandleID, getRailProps }) => 
				(<SliderRail getEventData={getEventData} activeHandleID={activeHandleID} getRailProps={getRailProps} onInsert={handleOnGrayClick} handleTooltipShow={handleMouseOver} handleTooltipHide={handleMouseOut} />)}
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
					currentTrack={props.currentSkipIndex}
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
	skipRanges: skipRanges(state),
	currentSkipIndex: currentSkipIndex(state),
  };
};
const mapDispatchToProps = (dispatch) => {
    return {
      setSkipRangeTimes: (newSkipTimes) => {
        dispatch(setSkipRangeTimes(newSkipTimes));
      },
      addSkipRange: (newValueInRange, step) => {
        dispatch(addSkipRange(newValueInRange,step));
      }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(GestureSkipSlider);
