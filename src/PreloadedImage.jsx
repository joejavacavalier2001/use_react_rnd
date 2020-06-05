import React, {useRef, useEffect, useCallback} from 'react';
import {connect} from "react-redux";
import {setSpecificBgSize} from "./actions/gestureActions";

const PreloadedImage = (props) => {

  let newref = useRef(null);
  let handleDelayedLoad = useCallback((event) => {
	  event.currentTarget.onload = null;
	  props.setSpecificBgSize([event.currentTarget.naturalWidth,event.currentTarget.naturalHeight],event.currentTarget.dataset.id);
	  event.stopPropagation();
  },[props]);

  useEffect(() => {
	if (newref.current)
		if (newref.current.complete)
			props.setSpecificBgSize([newref.current.naturalWidth,newref.current.naturalHeight],newref.current.dataset.id);
		else 
			newref.current.onload = handleDelayedLoad;
  },[props, handleDelayedLoad]);

  if (!newref.current)
  	return (<img src={props.src} ref={newref} key={props.index} data-id={props.index} alt="cannot load file" />);
 
  return null;
}

const mapDispatchToProps = (dispatch) => {
  return {
      setSpecificBgSize: (bgSize,slideNumber) => {
        dispatch(setSpecificBgSize(bgSize,slideNumber));
      }
  };
};
export default connect(null, mapDispatchToProps)(PreloadedImage);
