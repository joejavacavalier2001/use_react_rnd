import React, {useMemo} from 'react';
import {connect} from "react-redux";
import {getServerTestResponse, getServerError} from "./selectors";

const ReactGoogleLoginWrapper = (props) => {

	const responseMessage = useMemo(() => {
		let temp = props.serverResponse; 
		return ((temp) ? temp.statusText : "");
	}, [props]);
	const errorMessage = useMemo(() => {
		let temp = props.serverErrorMsg; 
		return temp;
	}, [props]);


	return (
		<>
		{(responseMessage) ? (<p>Server response: {responseMessage}</p>) : null}
		{(errorMessage) ? (<p>Server error message: {errorMessage}</p>) : null}
		</>
	);
}
const mapStateToProps = (state) => {
	return {
		serverErrorMsg: getServerError(state),
		serverResponse: getServerTestResponse(state)
	}
};

export default connect(mapStateToProps, null)(ReactGoogleLoginWrapper);
