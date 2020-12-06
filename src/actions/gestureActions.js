import axios from 'axios';

function setBackgroundOffset(bgOffset)
{
  if (Array.isArray(bgOffset))  
    return {
      type: 'SET_BACKGROUND_OFFSET',
      payload: bgOffset.slice()
    };
  return {};
}

function setCurrentGestureSizeAndLocation(newInfo)
{
  if (Array.isArray(newInfo))  
    return {
      type: 'SET_CURRENT_GESTURE_INFO',
      payload: newInfo.slice()
    };
  return {};
}

function changeCurrentGesture(strNewGesture)
{
  return {
    type: 'CHANGE_GESTURE_WITHIN_CURRENT_BG',
    payload: strNewGesture
  };
}

function changeCurrentSkipRange(strSkipRangeIndex)
{
	return {
		type: 'CHANGE_SKIPRANGE',
		payload: strSkipRangeIndex
	};
}

function changeBgSlide(strNewSlide)
{
  return {
    type: 'CHANGE_BG_SLIDE',
    payload: strNewSlide
  };
}

function setSpecificBgSize(bgDimensions,slideNumber)
{
  if (Array.isArray(bgDimensions))  
	return {
		type: 'SET_SPECIFIC_BACKGROUND_DIMENSIONS',
		payload: bgDimensions.slice().concat([parseInt(slideNumber)])
	};
  return {};
}

function initializePlaybackState()
{
	return {
		type: 'INIT_PLAYBACK',
		payload: 1
	};
}

function updatePlaybackState(currentMediaTime)
{
	return {
		type: 'UPDATE_GESTURE_SHOW_LIST_DURING_PLAYBACK',
		payload: currentMediaTime
	};
}

function updateMediaDuration(newDuration)
{
	return {
		type: 'UPDATE_MEDIA_DURATION',
		payload: newDuration
	};
}
function setGestureTimes(newTimes)
{
	return {
		type: 'SET_GESTURE_TIMES',
		payload: newTimes
	};
}
function setSkipRangeTimes(newTimes)
{
	return {
		type: 'SET_SKIP_TIMES',
		payload: newTimes
	};
}
function setPlaybackState(newValue)
{
	return {
		type: 'SET_PLAYING_STATE',
		payload: newValue
	};
}

function deleteGestureAtIndex(oldIndex)
{
	return {
		type: 'DELETE_GESTURE_AT_INDEX',
		payload: oldIndex
	}
}

function deleteSkipAtIndex(oldIndex)
{
	return {
		type: 'DELETE_SKIPRANGE_AT_INDEX',
		payload: oldIndex
	}
}

function addGesture(valueInNewRange,step)
{
	return {
		type: 'ADD_GESTURE',
		payload: [valueInNewRange, step]
	}
}

function addSkipRange(valueInNewRange,step)
{
	return {
		type: 'ADD_SKIPRANGE',
		payload: [valueInNewRange, step]
	}
}

function sampleAsychronousAction(inputValue){
	return {
		type: 'ASYCH',
		payload: new Promise((resolve,reject) => {
			setTimeout(() => {
				if (inputValue) {
					resolve(inputValue);
				} else {
					  reject("error message");
				}
			},5000);
		})
	}
}

function HideAsychronousDialogs() {
	return {
		type: 'HIDE_ASYCHRONOUS_DIALOGS',
		payload: 0 
	}
}

function TestTokenIdOnServer(token_id) {
	return {
		type: 'TOKEN_TEST',
		payload: new Promise((resolve,reject) => {
			axios({
				url: "http://rktlebnhwebworks.net/testTokenId.py",
				headers:{'Content-Type': 'application/json'},
				xsrfCookieName: '',
				xsrfHeaderName: '',
				maxRedirects: 0,
				data: JSON.stringify({id: token_id, subobj: {key1: 1, key2: 2}}),//'id='+token_id+'&id2=ghfg',
				method: "post"
			})
			.then((data) => {
				alert("some success");
				return data.data;
			})
			.then((data) => {
				console.log(data);
			})
			.catch((error) => {
				alert("some failure");
				console.log(error.toJSON());
				if (("response" in error) && (error.repsonse)) {
					reject(error.response.status);
				} else if (("message" in error) && (error.message)) {
					reject(error.message);
				}
			});
		})
	}
}

function ClearServerError() {
	return {
		type: 'CLEAR_ERROR',
		payload: ""
	}
}

function ClearServerTestResponse() {
	return {
		type: 'CLEAR_TEST_RESPONSE',
		payload: ""
	}
}

function UpdateGoogleResponseObj(newGoogleObject) {
	return {
		type: 'UPDATE_GOOGLE_OBJECT',
		payload: newGoogleObject
	}
}

function RespondToLogoutEvent() {
	return {
		type: 'RESPOND_TO_LOGOUT_EVENT',
		payload: ""
	}
}

function RespondToTicketExpiredEvent() {
	return {
		type: 'TICKET_EXPIRED',
		payload: ""
	}
}

function UpdateExpiresIn() {
	return {
		type: 'UPDATE_EXPIRES_IN',
		payload: ""
	}
}

export {
	setGestureTimes, 
	setCurrentGestureSizeAndLocation, 
	setSpecificBgSize, 
	setBackgroundOffset, 
	changeCurrentGesture, 
	changeCurrentSkipRange,
	changeBgSlide, 
	initializePlaybackState, 
	updatePlaybackState, 
	updateMediaDuration,
	setPlaybackState,
	deleteGestureAtIndex,
	deleteSkipAtIndex,
	addGesture,
	addSkipRange,
	setSkipRangeTimes,
	sampleAsychronousAction,
	HideAsychronousDialogs,
	TestTokenIdOnServer,
	ClearServerError,
	ClearServerTestResponse,
	UpdateGoogleResponseObj,
	RespondToLogoutEvent,
	RespondToTicketExpiredEvent,
	UpdateExpiresIn
};

