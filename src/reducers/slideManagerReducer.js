
import createTree from "functional-red-black-tree";
import {OrmManager} from "../models";
var orm = OrmManager.orm;
var mainArray = window.myslides;

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

function ParseGestureText(strGestureInfo)
{
  var piecesStrs = strGestureInfo.split(/,\s*/);
  if ((piecesStrs.length !== 4) || (piecesStrs.some(value => isNaN(parseFloat(value))))){
    throw new Error("Gesture info needs to contain four valid numbers for \"left,top,width,height\"");
  }
  return piecesStrs.map(value => parseFloat(value));
}

// ************************** create initial state by reading mainArray **************************************
const session = orm.session();
const {SlideManager, Slide, Gesture, ClearObj} = session;

var initialSlideMgr = SlideManager.create({slides: [], currentSlide: 0, currentPlaybackSlide: 0, playbackDuration: 0, playbackIsPlaying: false, currentGestureIndex: 0, playbackJumpTime: 0});

var prefix = mainArray.filter(value => ("Prefix" in value))[0].Prefix;
prefix = prefix.includes("/",prefix.length-1) ? prefix : (prefix + "/");

var currentGestureTree = null;
var currentClearTree = null;
var tempTree = null;
var gestureNumber = 0;
var currentSlide = null;
var parsingGesture = null;
var currentSlideNumber = -1;

mainArray.forEach((value) => {
	let currentPosition = value["Position"];

	if ("Slide" in value){
		currentSlideNumber++;
		if (currentGestureTree){
			currentSlide.gestureTree = currentGestureTree;
			currentSlide.clearTree = currentClearTree;
			initialSlideMgr.slides.push(currentSlide);
		}
		let pfile = value.Slide.substring(1);

		currentSlide = Slide.create({pictfile: prefix + pfile, width: 0, height: 0});
		if (tempTree){
			let tempKeys = tempTree.keys;
			tempKeys.forEach(key => tempTree.remove(key));
			tempTree = null;
		}
		tempTree = createTree();
		currentGestureTree = createTree();
		currentClearTree = createTree();
		gestureNumber = 0;

	} else if ("Gesture" in value){
		let gLoc = ParseGestureText(value["Gesture"]);
		let gSize = gLoc.splice(2,2);
		parsingGesture = Gesture.create({startTime: currentPosition, clearTime: Infinity, location: gLoc, dimensions: gSize, slideNumber: currentSlideNumber});
		currentGestureTree = currentGestureTree.insert(currentPosition,parsingGesture);
		tempTree = tempTree.insert(++gestureNumber,currentPosition);

	} else if ("Clear" in value){
		let startGesturePosition = tempTree.get(value["Clear"]);
		let oldGestureObj = currentGestureTree.get(startGesturePosition);
		oldGestureObj.clearTime = currentPosition;
		currentClearTree = currentClearTree.insert(currentPosition, ClearObj.create({startTime: currentPosition, gestureTime: startGesturePosition}));

	} else if ("Jump" in value) {
		initialSlideMgr.playbackJumpTime = parseFloat(value.Jump);
	}
});

if (currentGestureTree){
	currentSlide.gestureTree = currentGestureTree;
	currentSlide.clearTree = currentClearTree;
	initialSlideMgr.slides.push(currentSlide);	
}
if (tempTree){
	let tempKeys = tempTree.keys;
	tempKeys.forEach(key => tempTree.remove(key));
	tempTree = null;
}
initialSlideMgr.currentGestureKey = initialSlideMgr.slides[0].gestureTree.begin.key;
var initialState = session.state;

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
					newClearObj = ClearObj.create({...oldClearObj.ref, startTime: subarray[1]});
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

function InitPlayback_Internal(session)
{
	const {SlideManager, PlaybackManager} = session;
	let slideMgr = SlideManager.first();
	if (PlaybackManager.count())
		PlaybackManager.first().delete();

	if (slideMgr.playbackIsPlaying)
		throw new Error("InitPlayback_Internal was called during playback");

	let gestureTree = slideMgr.slides[0].gestureTree;
	let clearTree = slideMgr.slides[0].clearTree;

	let gestureIt = (gestureTree.length) ? gestureTree.begin : null;
	let clearIt = (clearTree.length) ? clearTree.begin : null;

	if ((gestureIt) && (gestureIt.key < slideMgr.playbackJumpTime)){
		gestureIt = gestureTree.le(slideMgr.playbackJumpTime);
		if (gestureIt.value.clearTime < slideMgr.playbackJumpTime)
			if (gestureIt.hasNext)
				gestureIt.next();
			else
				gestureIt = null;

		clearIt = (gestureIt) ? clearTree.find(gestureIt.value.clearTime) : null;
	}

	PlaybackManager.create({
		currentPlaybackDisplayGestures: [], 
		currentPlaybackSlide: 0,
		currentPlaybackGestureIt: gestureIt,
		currentPlaybackClearIt: clearIt,
		playbackGesturesIndecies: createTree()
	});
}

function UpdateGestureShowListDuringPlayback_Internal(session,payload)
{
	let {SlideManager, PlaybackManager} = session;
	let slideMgr = SlideManager.first();
	let playbackMgr = PlaybackManager.first();
	let {currentPlaybackGestureIt, playbackGesturesIndecies, currentPlaybackDisplayGestures, currentPlaybackClearIt} = playbackMgr;
	let updatedGestures = false;

	if (payload >= slideMgr.playbackDuration){
		slideMgr.playbackIsPlaying = false;
		slideMgr.currentPlaybackDisplayGestures = [];
		return;
	}
	if ((currentPlaybackGestureIt) && (payload >= currentPlaybackGestureIt.key)){
		let playbackObj = currentPlaybackGestureIt.value;
		currentPlaybackDisplayGestures.push(playbackObj);
		updatedGestures = true;
		playbackGesturesIndecies = playbackGesturesIndecies.insert(playbackObj.startTime, (currentPlaybackDisplayGestures.length-1));
		if (currentPlaybackGestureIt.hasNext)
			currentPlaybackGestureIt.next();
		else
			currentPlaybackGestureIt = null;

		playbackMgr.currentPlaybackGestureIt = currentPlaybackGestureIt;
		playbackMgr.playbackGesturesIndecies = playbackGesturesIndecies;
	}
	if ((currentPlaybackClearIt) && (payload >= currentPlaybackClearIt.key)){
		let currentPlaybackDisplayGestures = playbackMgr.currentPlaybackDisplayGestures;
		if (!playbackGesturesIndecies){
			console.log("strange error");
			console.log("at time: " + payload + " playbackGestureIndecies is undefined");
			console.log(new Error().stack);
			return;
		}
		let deleteIndex = playbackGesturesIndecies.get(currentPlaybackClearIt.value.gestureTime).value;
		currentPlaybackDisplayGestures.splice(deleteIndex,1);
		updatedGestures = true;

		if (currentPlaybackClearIt.hasNext)
			currentPlaybackClearIt.next();
		else
			currentPlaybackClearIt = null;

		playbackMgr.currentPlaybackClearIt = currentPlaybackClearIt;
	}

	if (updatedGestures)
		playbackMgr.currentPlaybackDisplayGestures = currentPlaybackDisplayGestures.slice();
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

}

const gestureReducer = (dbState = initialState, action) => {
	if (!dbState) return {};
	
	const sess = orm.session(dbState);

	if ((isObject(action)) && ("payload" in action) && ("type" in action)){
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
		  case 'CHANGE_GESTURE_WITHIN_CURRENT_BG':
			ChangeGestureWithinCurrentBg_Internal(slideMgr,action.payload);
			break;
		  case 'CHANGE_BG_SLIDE':
			ChangeBgSlide_Internal(slideMgr,action.payload);
			break;
		  case 'UPDATE_MEDIA_DURATION':
			slideMgr.playbackDuration = action.payload;
			break;
		  case 'INIT_PLAYBACK':
			InitPlayback_Internal(sess);
			break;
		  case 'SET_PLAYING_STATE':
			slideMgr.playbackIsPlaying = action.payload;
			break;
		  case 'UPDATE_GESTURE_SHOW_LIST_DURING_PLAYBACK':
			UpdateGestureShowListDuringPlayback_Internal(sess,action.payload);
			break;
		  case 'DELETE_GESTURE_AT_INDEX':
			DeleteGestureAtIndex_Internal(slideMgr,action.payload);
			break;
		  case 'ADD_GESTURE':
			AddGesture_Internal(sess,slideMgr,action.payload);
			break;
		  case 'SET_SKIP_TIME':
			slideMgr.playbackJumpTime = action.payload;
			break;
		  default:
			console.log("Inside default reducer case and action type is " + action.type);
			break;
		}
	}

	return sess.state;
}
export default gestureReducer;


