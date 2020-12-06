
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

function SetSpecificBackgroundDimensions_Internal(payload,slideMgr)
{
	const {slides} = slideMgr;
	slides[payload[2]].width = payload[0];
	slides[payload[2]].height = payload[1];
	slideMgr.slides = slides.slice(); // make shallow copy to trigger a detection of a new state
}

function SetCurrentGestureInfo_Internal(payload,slideMgr) 
{
	const {slides} = slideMgr;
	let currentGestureTree = slides[slideMgr.currentSlide].gestureTree;
	let gestureObj = currentGestureTree.get(slideMgr.currentGestureKey);
	gestureObj.location = [payload[0], payload[1]];
	gestureObj.dimensions = [payload[2], payload[3]];
	slides[slideMgr.currentSlide].gestureTree = currentGestureTree.find(slideMgr.currentGestureKey).update(gestureObj);
	slideMgr.slides = slides.slice(); // make shallow copy to trigger a detection of a new state
}

function SetGestureTimes_Internal(session,payload,dbState)
{
	console.log("inside SetGestureTimes_Internal");
	const { SlideManager,ClearObj, Gesture } = session;
	let slideMgr = SlideManager.first();
	const {slides,currentSlide} = slideMgr;
	let newGestureTree = slides[currentSlide].gestureTree;
	let newClearTree = slides[currentSlide].clearTree;

	let rawGestures = slides[currentSlide].gestureTree.values;
	let oldGestureTimeRanges = rawGestures.map((gestureObj) => {return [gestureObj.startTime, gestureObj.clearTime];});

	payload.forEach(function(subarray,index){
		let currentSubArray = this.oldGestureList2[index];
		let tempBoolArray = [currentSubArray[1] !== subarray[1], currentSubArray[0] !== subarray[0]];
		const boolreducer = (acc,cv) => {return ((acc*2) + (cv ? 1 : 0));};
		let bitmask = tempBoolArray.reduce(boolreducer,0);
		let oldGestureObj = (bitmask) ? newGestureTree.get(currentSubArray[0]) : null;
		let newGestureObj = null;
		let oldClearObj = null;
		let newClearObj = null;
		switch (bitmask){
			case 1: // change start time of gesture
				newGestureObj = Gesture.create({...oldGestureObj.ref, startTime: subarray[0]});
				newGestureTree = newGestureTree.insert(subarray[0],newGestureObj);
				newGestureTree = newGestureTree.remove(oldGestureObj.startTime);
				oldGestureObj.delete();
				oldClearObj = newClearTree.get(oldGestureObj.clearTime);
				if (oldClearObj)
					oldClearObj.gestureTime = newGestureObj.startTime;
				break;
			case 2: // change end time of gesture
				if (oldGestureObj.clearTime !== Infinity){ 
					oldClearObj = newClearTree.get(oldGestureObj.clearTime);
					newClearObj = ClearObj.create({...oldClearObj.ref, startTime: subarray[1]});
					newClearTree = newClearTree.remove(oldClearObj.startTime);
					oldClearObj.delete();
				} else 
					newClearObj = ClearObj.create({startTime: subarray[1], gestureTime: oldGestureObj.startTime});

				newClearTree = newClearTree.insert(newClearObj.startTime,newClearObj);
				oldGestureObj.clearTime = subarray[1];
				break;
			case 3:  // change both
				newGestureObj = Gesture.create({...oldGestureObj.ref, startTime: subarray[0], clearTime: subarray[1]});
				newGestureTree = newGestureTree.insert(subarray[0],newGestureObj);

				if (oldGestureObj.clearTime !== Infinity){
					oldClearObj = newClearTree.get(oldGestureObj.clearTime);
					newClearObj = ClearObj.create({gestureTime: subarray[0], startTime: subarray[1]});
					newClearTree = newClearTree.remove(oldGestureObj.clearTime);
					oldClearObj.delete();
				} else 
					newClearObj = ClearObj.create({startTime: subarray[0], gestureTime: oldGestureObj.startTime});

				newClearTree = newClearTree.insert(newClearObj.startTime,newClearObj);
				newGestureTree = newGestureTree.remove(oldGestureObj.startTime);
				oldGestureObj.delete();
				break;
			default:
				break;
		}
	},{oldGestureList2: oldGestureTimeRanges});
	slides[slideMgr.currentSlide].gestureTree = newGestureTree;
	slides[slideMgr.currentSlide].clearTree = newClearTree;
	slideMgr.currentGestureKey = payload[slideMgr.currentGestureIndex][0];
	slideMgr.slides = slides.slice();

	console.log("new gesture clear tree lists");
	slides[slideMgr.currentSlide].gestureTree.forEach((key,currentGestureObj) => {
		console.log("at gesture key: " + key);
		console.log("startTime: " + currentGestureObj.startTime);
		console.log("clearTime: " + currentGestureObj.clearTime);
		console.log(" ");
	});
	slides[slideMgr.currentSlide].clearTree.forEach((key,currentClearObj) => {
		console.log("at clear key: " + key);
		console.log("gestureTime: " + currentClearObj.gestureTime);
		console.log("startTime: " + currentClearObj.startTime);
		console.log(" ");
	});
}

function SetSkipRangeTimes_Internal(session,payload,dbState)
{
	const { SlideManager, SkipRange } = session;
	let slideMgr = SlideManager.first();
	const {slides,currentSlide} = slideMgr;
	let newSkipTree = slides[currentSlide].skipTree;

	let rawSkipRanges = slides[currentSlide].skipTree.values;
	let oldSkipRanges = rawSkipRanges.map((skipRangeObj) => {return [skipRangeObj.skipTime, skipRangeObj.resumeTime];});

	payload.forEach(function(subarray,index){
		let currentSubArray = this.oldSkipList[index];
		let tempBoolArray = [currentSubArray[1] !== subarray[1], currentSubArray[0] !== subarray[0]];
		const boolreducer = (acc,cv) => {return ((acc*2) + (cv ? 1 : 0));};
		let bitmask = tempBoolArray.reduce(boolreducer,0);
		let oldSkipRangeObj = (bitmask) ? newSkipTree.get(currentSubArray[0]) : null;
		let newSkipRangeObj = null;

		switch (bitmask){
			case 1: // change start time of gesture
				newSkipRangeObj = SkipRange.create({...oldSkipRangeObj.ref, skipTime: subarray[0]});
				newSkipTree = newSkipTree.insert(subarray[0],newSkipRangeObj);
				newSkipTree = newSkipTree.remove(oldSkipRangeObj.skipTime);
				oldSkipRangeObj.delete();
				break;
			case 2: // change end time of gesture
				oldSkipRangeObj.resumeTime = subarray[1];
				break;
			case 3:  // change both
				newSkipRangeObj = SkipRange.create({skipTime: subarray[0], resumeTime: subarray[1]});
				newSkipTree = newSkipTree.insert(subarray[0],newSkipRangeObj);
				newSkipTree = newSkipTree.remove(oldSkipRangeObj.skipTime);
				oldSkipRangeObj.delete();
				break;
			default:
				break;
		}
	},{oldSkipList: oldSkipRanges});
	slides[slideMgr.currentSlide].skipTree = newSkipTree;
	slideMgr.slides = slides.slice();
}

function ChangeGestureWithinCurrentBg_Internal(slideMgr,payload)
{
	let newGestureIndex = parseInt(payload);
	slideMgr.currentGestureIndex = newGestureIndex;
	let gestureTree = slideMgr.slides[slideMgr.currentSlide].gestureTree;
	let gestureArray = gestureTree.values;
	slideMgr.currentGestureKey = gestureArray[newGestureIndex].startTime;
}

function ChangeBgSlide_Internal(slideMgr,payload)
{
	let newSlideIndex = parseInt(payload);
	slideMgr.currentSlide = newSlideIndex;
	ChangeGestureWithinCurrentBg_Internal(slideMgr,0);
}


function DeleteGestureAtIndex_Internal(slideMgr,payload)
{
	let index = parseInt(payload);
	let {slides, currentSlide} = slideMgr;

	let gestureTree = slides[currentSlide].gestureTree;
	let gestureObj = gestureTree.at(index).value;
	gestureTree = gestureTree.remove(gestureObj.startTime);
	gestureObj.delete();

	if (gestureTree.length){
		if ((index + 1) > gestureTree.length)
			index--;
		gestureObj = gestureTree.at(index).value;
		slideMgr.currentGestureIndex = index;
		slideMgr.currentGestureKey = gestureObj.startTime;
	} else {
		slideMgr.currentGestureKey = 0;
		slideMgr.currentGestureIndex = 0;
	}

	slides[currentSlide].gestureTree = gestureTree;
	slideMgr.slides = slides.slice();
}

function DeleteSkipAtIndex_Internal(slideMgr,payload)
{
	let index = parseInt(payload);
	let {slides, currentSlide} = slideMgr;

	let skipTree = slides[currentSlide].skipTree;
	let skipRangeObj = skipTree.at(index).value;
	skipTree = skipTree.remove(skipRangeObj.skipTime);
	skipRangeObj.delete();

	if (skipTree.length){
		if ((index + 1) > skipTree.length)
			index--;
		skipRangeObj = skipTree.at(index).value;
		slideMgr.currentSkipIndex = index;
		slideMgr.currentSkipKey = skipRangeObj.skipTime;
	} else {
		slideMgr.currentSkipKey = 0;
		slideMgr.currentSkipIndex = 0;
	}

	slides[currentSlide].skipTree = skipTree;
	slideMgr.slides = slides.slice();
}

function AddGesture_Internal(session,slideMgr,payload)
{
	const {Gesture, ClearObj} = session;
	const {slides,currentSlide,playbackDuration,currentGestureIndex} = slideMgr;
	let oldGestureTree = slides[currentSlide].gestureTree;
	let newClearTree = slides[currentSlide].clearTree;
	let newMin = 0;
	let newMax = 0; //playbackDuration 
	let newValueInRange = payload[0];
	let step = payload[1];
	oldGestureTree.forEach((key,gestureObj) => {
		if (key > newValueInRange){
			newMax = key;
			return true;
		} else {
			newMin = gestureObj.clearTime;
		}
		return false;
	});
	if (!newMax)
		newMax = playbackDuration;

	if (newMin)
		newMin += step;


	let newGestureObj = Gesture.create({startTime: newMin, clearTime: newMax - step, slideNumber: currentSlide, location: [0,0], dimensions: [50,50]});
	let newGestureTree = oldGestureTree.insert(newMin,newGestureObj);
	let newClearObj = ClearObj.create({startTime: newMax - step, gestureTime: newMin});
	newClearTree = newClearTree.insert(newMax - step, newClearObj);
	slides[currentSlide].gestureTree = newGestureTree;
	slides[currentSlide].clearTree = newClearTree;
	slideMgr.slides = slides.slice();
	if (newMin < oldGestureTree.end.key){
		slideMgr.currentGestureKey = newGestureTree.at(currentGestureIndex).key;
	}
	console.log("new gesture clear tree lists");
	slides[slideMgr.currentSlide].gestureTree.forEach((key,currentGestureObj) => {
		console.log("at gesture key: " + key);
		console.log("startTime: " + currentGestureObj.startTime);
		console.log("clearTime: " + currentGestureObj.clearTime);
		console.log(" ");
	});
	slides[slideMgr.currentSlide].clearTree.forEach((key,currentClearObj) => {
		console.log("at clear key: " + key);
		console.log("gestureTime: " + currentClearObj.gestureTime);
		console.log("startTime: " + currentClearObj.startTime);
		console.log(" ");
	});
}

function AddSkip_Internal(session,slideMgr,payload)
{
	const {SkipRange} = session;
	const {slides, currentSlide,playbackDuration} = slideMgr;

	const oldSkipTree = slides[currentSlide].skipTree;
	let newMin = 0;
	let newMax = 0;
	let newValueInRange = payload[0];
	let step = payload[1];
	oldSkipTree.forEach((key,skipRangeObj) => {
		if (key > newValueInRange){
			newMax = key;
			return true;
		} else {
			newMin = skipRangeObj.resumeTime;
		}
		return false;
	});
	if (!newMax)
		newMax = playbackDuration;

	if (newMin)
		newMin += step;

	if (!oldSkipTree.length){
		slideMgr.currentSkipIndex = 0;
		slideMgr.currentSkipKey = newMin;
	}

	let newSkipRangeObj = SkipRange.create({skipTime: newMin, resumeTime: newMax});
	let newSkipTree = oldSkipTree.insert(newMin,newSkipRangeObj);
	slides[currentSlide].skipTree = newSkipTree;
	slideMgr.slides = slides.slice();
}


const gestureReducer = (dbState, action) => {
	if (!dbState)return {};
	
	const sess = orm.session(dbState);
	if (action.type.search(/redux\/INIT/) !== -1){
		return dbState;
	}

	if ((isObject(action)) && ("type" in action)){
		const {SlideManager} = sess;
		let slideMgr = SlideManager.first();

		switch (action.type) {
		  case 'SET_SPECIFIC_BACKGROUND_DIMENSIONS':
			if ( (Array.isArray(action.payload)) && (action.payload.length === 3) && (action.payload.every((element) => ((typeof element) === 'number'))) )
				SetSpecificBackgroundDimensions_Internal(action.payload,slideMgr);
			break;
		  case 'SET_CURRENT_GESTURE_INFO':
			if ( (Array.isArray(action.payload)) && (action.payload.length === 4) && (action.payload.every((element) => ((typeof element) === 'number'))) )
				SetCurrentGestureInfo_Internal(action.payload,slideMgr);
			break;
		  case 'SET_GESTURE_TIMES':
			SetGestureTimes_Internal(sess,action.payload,dbState);
			break;
		  case 'SET_SKIP_TIMES':
			SetSkipRangeTimes_Internal(sess,action.payload,dbState);
			break;
		  case 'CHANGE_GESTURE_WITHIN_CURRENT_BG':
			ChangeGestureWithinCurrentBg_Internal(slideMgr,action.payload);
			break;
		  case 'CHANGE_SKIPRANGE':
			slideMgr.currentSkipIndex = parseInt(action.payload);
			break;
		  case 'CHANGE_BG_SLIDE':
			ChangeBgSlide_Internal(slideMgr,action.payload);
			break;
		  case 'UPDATE_MEDIA_DURATION':
			slideMgr.playbackDuration = action.payload;
			break;
		  case 'DELETE_GESTURE_AT_INDEX':
			DeleteGestureAtIndex_Internal(slideMgr,action.payload);
			break;
		  case 'DELETE_SKIPRANGE_AT_INDEX':
			DeleteSkipAtIndex_Internal(slideMgr,action.payload);
			break;
		  case 'ADD_GESTURE':
			AddGesture_Internal(sess,slideMgr,action.payload);
			break;
		  case 'ADD_SKIPRANGE':
			AddSkip_Internal(sess,slideMgr,action.payload);
			break;
		  case 'ASYCH_PENDING':
			slideMgr.showAsynchronousDialogs = [true, false, false];	
			break;
		  case 'ASYCH_FULFILLED':
			slideMgr.showAsynchronousDialogs = [false, true, false];	
			break;
		  case 'ASYCH_REJECTED':
			slideMgr.showAsynchronousDialogs = [false, false, true];	
			break;
		  case 'HIDE_ASYCHRONOUS_DIALOGS':
			slideMgr.showAsynchronousDialogs = [false, false, false];
			break;
		  default:
			break;
		}
	}

	return sess.state;
}
export default gestureReducer;


