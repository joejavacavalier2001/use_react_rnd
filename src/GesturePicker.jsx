import React, {useState, useRef, useEffect, useMemo, useCallback} from 'react';
import {changeCurrentGesture, changeBgSlide, deleteGestureAtIndex} from "./actions/gestureActions";
import {gestureList2,slideNameList,currentGestureIndex,currentSlide} from "./selectors";
import {connect} from "react-redux";
import Button from 'react-bootstrap/Button';
import DeleteConfirmDialog from "./DeleteConfirmDialog";

const GesturePicker = (props) => {
	
  const buttonRef = useRef(null);
  let renderSlideOptions = useMemo(() => {
    return props.slideNameList.map((slideName,arrayIndex) => {
      return (<option value={arrayIndex} key={arrayIndex}>{slideName}</option>);
    });
  },[props]);

  let renderGestureOptions = useMemo(() => {
    return props.gestureTimes.map((gestureTimePair,gestureNumber) => {
      return (<option value={gestureNumber} key={gestureNumber}>{gestureNumber+1}</option>);
    });
  },[props]);

  let onGestureChange = useCallback((e) => {
	  props.changeCurrentGesture(e.target.value);
  },[props]);
  let onSlideChange = useCallback((e) => {
	  props.changeBgSlide(e.target.value);
  },[props]);

  let [showDialog,ChangeDialogStatus] = useState(false);
  let handleShowDialogClick = useCallback(() => {
	  ChangeDialogStatus(true);
  },[ChangeDialogStatus]);
  let handleDialogCallback = useCallback((shouldDelete) => {
	  ChangeDialogStatus(false); 
	  if (shouldDelete)
		  props.deleteGestureAtIndex(props.currentIndex);
  },[ChangeDialogStatus,props]);
  let currentGestureTimes = useMemo(() => {return props.gestureTimes[props.currentIndex];},[props]);
  useEffect(() => {
	  if (buttonRef.current)
	  	buttonRef.current.blur();
  });
  return (
    <div id="GesturePicker">
      <p>You will need to select a background image.</p> 
      <p>Once you selected an image, you can choose a gesture to edit that will appear on that image.</p>   
      <div id="select_image_panel">
        <p>Choose a background image</p>
        <select id="select_image" name="select_image" value={props.currentSlideIndex} onChange={onSlideChange}>
			{renderSlideOptions}
        </select>     
      </div>
	  {(
	  (props.gestureTimes.length) ?
	  (<div id="select_gesture_panel">
		<p>Choose a gesture to edit</p>
		<select name="select_gesture" id="select_gesture" value={props.currentIndex} onChange={onGestureChange}>
			{renderGestureOptions}
		</select>
	    <Button ref={buttonRef} variant="danger" onClick={handleShowDialogClick}>Delete Current Gesture</Button>
	    {((showDialog) && (<DeleteConfirmDialog skipDialog={false} currentGestureTimes={currentGestureTimes} dialogCallback={handleDialogCallback} show={showDialog} />))}
      </div>) : null
	  )}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    currentSlideIndex: currentSlide(state), //state.currentGesture.currentSlideIndex2,
    gestureTimes: gestureList2(state),//state.currentGesture.gestureList2,
    currentIndex: currentGestureIndex(state), //state.currentGesture.currentGestureIndex, 
    slideNameList: slideNameList(state) //state.currentGesture.slideNameList
  };
};
const mapDispatchToProps = (dispatch) => {
    return {
      changeCurrentGesture: (strNewGesture) => {
        dispatch(changeCurrentGesture(strNewGesture));
      },
      changeBgSlide: (strNewSlide) => {
        dispatch(changeBgSlide(strNewSlide));
      },
	  deleteGestureAtIndex: (oldIndex) => {
	    dispatch(deleteGestureAtIndex(oldIndex));
	  }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(GesturePicker);
