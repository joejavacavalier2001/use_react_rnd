import React, {useCallback} from 'react';
import {connect} from "react-redux";
import { GoogleLogin } from 'react-google-login';
import { UpdateGoogleResponseObj, TestTokenIdOnServer, RespondToLogoutEvent} from "./actions/gestureActions";

const ReactGoogleLoginWrapper = (props) => {

	const onSuccessHandler = useCallback((arg) => {
		console.log(arg);
		let auth = window.gapi.auth2.getAuthInstance();
		auth.isSignedIn.listen((param) => {
			if (!param){
				console.log("User has logged out");
				props.OnLoggedOut();
			}
		});
		let expires = (arg.wc.expires_in - 1) * 1000;
		setTimeout(() => {props.OnTicketExpired();},expires);
		
		props.UpdateGoogleObj(arg);
		props.TestToken(arg.tokenId);
	},[props]);
	const onFailureHandler = (arg) => {
		console.log(arg);
	};

	return (
		<GoogleLogin
			clientId="571906986512-6tg59t12ugt9pbvp46bis6msvi850dcv.apps.googleusercontent.com"
			onSuccess={onSuccessHandler}
			onFailure={onFailureHandler}
			isSignedIn={false}
			cookiePolicy={'single_host_origin'}
		/>
	);
}
const mapDispatchToProps = (dispatch) => {
	return {
		UpdateGoogleObj: (newGoogleObj) => {dispatch(UpdateGoogleResponseObj(newGoogleObj));},
		TestToken: (tokenId) => {dispatch(TestTokenIdOnServer(tokenId));},
		OnLoggedOut: () => {dispatch(RespondToLogoutEvent());}
	}
};

export default connect(null, mapDispatchToProps)(ReactGoogleLoginWrapper);
