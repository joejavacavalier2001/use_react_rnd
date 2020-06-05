
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

function addGesture(valueInNewRange,step)
{
	return {
		type: 'ADD_GESTURE',
		payload: [valueInNewRange, step]
	}
}

export {
	setGestureTimes, 
	setCurrentGestureSizeAndLocation, 
	setSpecificBgSize, 
	setBackgroundOffset, 
	changeCurrentGesture, 
	changeBgSlide, 
	initializePlaybackState, 
	updatePlaybackState, 
	updateMediaDuration,
	setPlaybackState,
	deleteGestureAtIndex,
	addGesture
};

