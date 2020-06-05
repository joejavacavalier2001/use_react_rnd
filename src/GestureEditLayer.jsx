import React, {useMemo, useCallback} from 'react';
import {setCurrentGestureSizeAndLocation} from "./actions/gestureActions";
import {connect} from "react-redux";
import { Rnd } from "react-rnd";
import {gestureList2,slideInfo,currentEditingGesture,currentGestureIndex,currentSlide,playbackIsPlaying} from "./selectors";

var GestureEditLayer = (props) => {
	
  let containerStyles = {
      width: props.pictureWidth, 
      height: props.pictureHeight, 
      border: '1px solid black', 
      background: 'url("' + props.bgPic + '")'
  };
  let enableSingleResize = useMemo(() => {return !props.playbackIsPlaying;},[props]);
  const currentEnableResizing = useMemo(() => {
	 return {
		 bottom: enableSingleResize,
		 bottomRight: enableSingleResize,
         left: enableSingleResize,
         right: enableSingleResize,
         top: enableSingleResize,
         topLeft: enableSingleResize,
         topRight: enableSingleResize
	 };
  },[enableSingleResize]);
  
  let UpdateGlobalGestureLocation = useCallback((e,d) => {
	  props.updateGestureInfo([d.x, d.y, d.node.clientWidth, d.node.clientHeight]);
  },[props]);
  let UpdateGlobalGestureSize = useCallback((e, dir, ref, delta, p) => {
	  props.updateGestureInfo([p.x,p.y,ref.offsetWidth, ref.offsetHeight]);
  },[props]);
  return (
    <div id="GestureEditLayer" style={containerStyles} key={props.currentSlideIndex}>
	  {((props.width && props.height) ? 
      (<Rnd 
        default={{x: props.left, y:props.top, width: props.width, height: props.height}} 
        onDragStop={UpdateGlobalGestureLocation}
        onResizeStop={UpdateGlobalGestureSize}
	    disableDragging={props.playbackIsPlaying}
	    enableResizing={currentEnableResizing}
        bounds="parent" 
        key={props.gestureTimes[props.currentIndex][0]}
      />) : null)}
    </div>
  );
};
const mapStateToProps = (state) => {
  let slideinfo = slideInfo(state);
  let editingGesture = currentEditingGesture(state);
  return {
	// all the slides are preloaded so their sizes should be known
    bgPic: slideinfo.pictfile, 
    pictureWidth: slideinfo.width, 
    pictureHeight: slideinfo.height, 

    width: (editingGesture) ? editingGesture.dimensions[0] : 0, 
    height: (editingGesture) ? editingGesture.dimensions[1] : 0, 
    left: (editingGesture) ? editingGesture.location[0] : 0, 
    top: (editingGesture) ? editingGesture.location[1] : 0, 
	gestureTimes: gestureList2(state), 
	currentIndex: currentGestureIndex(state), 
    currentSlideIndex: currentSlide(state), 
	playbackIsPlaying: playbackIsPlaying(state) 
  };
};
const mapDispatchToProps = (dispatch) => {
    return {
	  updateGestureInfo: (newInfo) => {
		dispatch(setCurrentGestureSizeAndLocation(newInfo));
	  }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(GestureEditLayer);
