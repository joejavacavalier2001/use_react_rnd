import React, {useState, useCallback, useMemo} from 'react';
import {connect} from "react-redux";
import Button from 'react-bootstrap/Button';
import {HideAsychronousDialogs, sampleAsychronousAction} from "./actions/gestureActions";
import {whichAsychronousDialogs} from "./selectors";
import {DuxDialog} from 'duxpanel';
import '../node_modules/duxpanel/website/dist/duxpanel.css';

const ShowTriggerAsychAction = (props) => {
  const [asychValue,setAsychValue] = useState(1);
  let showdialog = useMemo(() => {return props.asychronousStep !== "none";},[props]);

  const handleInputChange = useCallback((event) => {
	  setAsychValue(event.target.value);
  },[setAsychValue]);
  
  const handleClickAsych = useCallback(() => {
	  props.startAsychronousAction(parseFloat(asychValue));
  },[props,asychValue]);
  
  return (
	  	<>
	  		<input type="number" onChange={handleInputChange} value={asychValue} />
	  		<Button variant="primary" onClick={handleClickAsych}>Start Asynchronous Action</Button>
	  		<DuxDialog show={showdialog} title="Sample asynchronous action is in progress or has concluded"
	  					onClose={props.HideAsychronousDialogs} onEscPressed={props.HideAsychronousDialogs}>
	  					
	  			<h3>The asynchronous promise is (or has been) {props.asychronousStep}</h3>
				<Button variant="primary" onClick={props.HideAsychronousDialogs}>Close</Button>

	  		</DuxDialog>
	  </>
  );
};

const mapStateToProps = (state) => {
  return {
	  asychronousStep: whichAsychronousDialogs(state)
  };
};
const mapDispatchToProps = (dispatch) => {
	return {
		startAsychronousAction: (input) => {
			dispatch(sampleAsychronousAction(input));
		},
		HideAsychronousDialogs: () => {
			dispatch(HideAsychronousDialogs());
		}
	}
};

export default connect(mapStateToProps,mapDispatchToProps)(ShowTriggerAsychAction);
