
import orm from "../models";

function isObject(mysteryParam)
{
  var potentialProto = null;
  var output = false;
  try{
    potentialProto = Object.getPrototypeOf(mysteryParam);
  }catch (e){
    output = false;
  }
  if (potentialProto)
    output = true;

  return output;
}

const googleReducer = (dbState, action) => {
	if (!dbState) return {};

	const sess = orm.session(dbState);
	const {LoginManager} = sess;

	if (action.type.search(/redux\/INIT/) !== -1){
		LoginManager.create({googleLoginResponseObj: null, serverErrorTxt: "", expired: false, expires_in: 0});
		return sess.state;
	}
	
	if ((isObject(action)) && ("payload" in action) && ("type" in action)){
		let loginMgr = LoginManager.first();
		let googleObj = loginMgr.googleLoginResponseObj;
		switch (action.type) {
		  case 'UPDATE_GOOGLE_OBJECT':
			loginMgr.googleLoginResponseObj = action.payload;
			break;
		  case 'LOGOUT_PRESSED':
		  case 'RESPOND_TO_LOGOUT_EVENT':
		  case 'TICKET_EXPIRED':
			if (googleObj){
				googleObj.disconnect();
				loginMgr.googleLoginResponseObj = null;
			}
			loginMgr.serverErrorTxt = "";
			loginMgr.serverTestResponse = "";
			if (action.type === 'TICKET_EXPIRED'){
				loginMgr.expired = true;
			}
			break;
		  case 'UPDATE_EXPIRES_IN':
			if (googleObj){
				let authresponse = googleObj.getAuthResponse(true);
				loginMgr.expires_in = authresponse.expires_in;
			}
			break;

		  case 'CLEAR_ERROR':
			loginMgr.serverErrorTxt = "";
			break;
		  case 'CLEAR_TEST_RESPONSE':
			loginMgr.serverTestResponse = "";
			break;
		  case 'TOKEN_TEST_FULFILLED':
			loginMgr.serverTestResponse = action.payload;
			loginMgr.serverErrorTxt = "";
			break;
		  case 'TOKEN_TEST_REJECTED':
			loginMgr.serverErrorTxt = action.payload;
			loginMgr.serverTestResponse = "";
			break;
		  default:
			break;
		}
	}

	return sess.state;
}
export default googleReducer;


