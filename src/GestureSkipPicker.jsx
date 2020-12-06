import React, {useState, useRef, useEffect, useMemo, useCallback} from 'react';
import {deleteSkipAtIndex, changeCurrentSkipRange} from "./actions/gestureActions";
import {skipRanges,currentSkipIndex} from "./selectors";
import {connect} from "react-redux";
import Button from 'react-bootstrap/Button';
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const GestureSkipPicker = (props) => {
	
  const buttonRef = useRef(null);

  let renderSkipOptions = useMemo(() => {
    return props.skipTimes.map((skipRangeObj,skipNumber) => {
      return (<option value={skipNumber} key={skipNumber+1000}>{skipNumber+1}</option>);
    });
  },[props]);

  let onGestureChange = useCallback((e) => {
	  props.changeCurrentSkipRange(e.target.value);
  },[props]);
  let [showDialog,ChangeDialogStatus] = useState(false);
  let handleShowDialogClick = useCallback(() => {
	  ChangeDialogStatus(true);
  },[ChangeDialogStatus]);
  let handleDialogCallback = useCallback((shouldDelete) => {
	  ChangeDialogStatus(false); 
	  if (shouldDelete)
		  props.deleteSkipAtIndex(props.currentSkipIndex);
  },[ChangeDialogStatus,props]);
  let currentSkipTimes = useMemo(() => {return props.skipTimes[props.currentSkipIndex];},[props]);
  useEffect(() => {
	  if (buttonRef.current)
	  	buttonRef.current.blur();
  });
  return (
	  <>
	  {((props.skipTimes.length) ?
	  (
		<Container id="skipselector_block" fluid>
		<Row>
		  	<Col><p>Select a skip range to delete:</p></Col>
		</Row>

		<Row>
			<Col md={1}><select name="select_skip" id="select_skip" value={props.currentIndex} onChange={onGestureChange}>{renderSkipOptions}</select></Col>
	    	<Col><Button ref={buttonRef} variant="danger" onClick={handleShowDialogClick}>Delete Current Skip Range</Button></Col>
		</Row>


	    <Row>
			<Col><DeleteConfirmDialog skipDialog={true} currentSkipTimes={currentSkipTimes} dialogCallback={handleDialogCallback} show={showDialog} /></Col>
		</Row>
		</Container>
	  )
       : null
	  )}
	  </>
  );
};

const mapStateToProps = (state) => {
  return {
    currentSkipIndex: currentSkipIndex(state), //state.currentGesture.currentSlideIndex2,
    skipTimes: skipRanges(state),//state.currentGesture.gestureList2,
  };
};
const mapDispatchToProps = (dispatch) => {
    return {
	  deleteSkipAtIndex: (oldIndex) => {
	    dispatch(deleteSkipAtIndex(oldIndex));
	  },
	  changeCurrentSkipRange: (strSkipRangeIndex) => {
		dispatch(changeCurrentSkipRange(strSkipRangeIndex));
	  }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(GestureSkipPicker);
