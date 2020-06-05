
import createTree, {RedBlackTree} from "functional-red-black-tree";
var mainArray = window.myslides;
//var createTree = require("functional-red-black-tree");

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

var prefix = mainArray.filter(value => value.hasOwnProperty("Prefix"))[0].Prefix;
prefix = prefix.includes("/",prefix.length-1) ? prefix : (prefix + "/");

var slideInfoArray = [];
var slideInfoArrayIndex = 0;
var currentTree = null;
var tempTree = null;
var gestureNumber = 0;

mainArray.forEach((value) => {
	let currentPosition = value["Position"];

	if ("Slide" in value){
		if (currentTree){
			let slideItem = slideInfoArray[slideInfoArrayIndex-1];
			slideItem["gestureTree"] = currentTree;
		}
		let pfile = value.Slide.substring(1);

		// preloading is handled by react components and redux
		// it won't work here, I tried - RKT
		slideInfoArray[slideInfoArrayIndex++] = {pictfile: prefix + pfile};
		currentTree = createTree();
		if (tempTree){
			let tempKeys = tempTree.keys;
			tempKeys.forEach(key => tempTree.remove(key));
			tempTree = null;
		}
		tempTree = createTree();
		gestureNumber = 0;

	} else if ("Gesture" in value){
		let gestureInfo = ParseGestureText(value["Gesture"]);
		let previousVal = currentTree.get(currentPosition);
		if (previousVal)
			previousVal["ShowInfo"] = gestureInfo;
		else
			currentTree = currentTree.insert(currentPosition, {Time: currentPosition, ShowInfo: gestureInfo});
		tempTree = tempTree.insert(++gestureNumber,currentPosition);

	} else if ("Clear" in value){
		let startGesturePosition = tempTree.get(value["Clear"]);
		let oldStartObj = currentTree.get(startGesturePosition);
		oldStartObj["GestureClearTime"] = currentPosition;
		let previousVal = currentTree.get(currentPosition);
		if (previousVal)
			previousVal["ClearInfo"] = startGesturePosition;
		else
			currentTree = currentTree.insert(currentPosition, {Time: currentPosition, ClearInfo: startGesturePosition});	
	}
});

if (currentTree){
	let slideItem = slideInfoArray[slideInfoArrayIndex-1];
	let oldObj = currentTree.get(12);
	let newObj = {...oldObj, someNewProperty: "newValue"};
	let newTree = currentTree.find(12).update(newObj);
	console.log(newTree instanceof RedBlackTree);
	slideItem["gestureTree"] = newTree;
	console.log("justed used update()");
}
if (tempTree){
	let tempKeys = tempTree.keys;
	tempKeys.forEach(key => tempTree.remove(key));
	tempTree = null;
}
var initialGestureTree = slideInfoArray[0].gestureTree;
var initialGestureTimes = [];
var initialGestureLocation = null;

initialGestureTree.forEach((key, treeValue) => {
	let newTimes = [];
	if ("ShowInfo" in treeValue){
		newTimes.push(treeValue["Time"]);

		if (!initialGestureLocation)
			initialGestureLocation = treeValue["ShowInfo"].slice();

		if ("GestureClearTime" in treeValue)
			newTimes.push(treeValue["GestureClearTime"]);
		else
			newTimes.push(Infinity);

		initialGestureTimes.push(newTimes);
	}
});

var initialGestureSize = initialGestureLocation.splice(2,2);
var tempSInfo = slideInfoArray[0];
var initialBgSize = ((tempSInfo.hasOwnProperty("width") && tempSInfo.width) ? [tempSInfo.width, tempSInfo.height] : [0,0]); 
var slideNames = slideInfoArray.map((x) => {
	let a = x.pictfile.split("/"); 
	return a[a.length-1];
});
var initialURLs = slideInfoArray.map(x => x.pictfile);

var initialState = {
  slideNameList: slideNames,
  slideURLs: initialURLs, 
  slideList2: slideInfoArray,
  currentSlideIndex2: 0,
  gestureList2: initialGestureTimes,
  currentGestureKey: initialGestureTimes[0][0],
  currentGestureIndex: 0,
  gestureSize: initialGestureSize,
  gestureLocation: initialGestureLocation, 

  playbackDuration: 0,
  playbackIsPlaying: false,
  playbackSlideIndex: 0,
  playbackSlideURL: "",
  playbackSlideWidth: 0,
  playbackSlideHeight: 0,
  playbackGestures: [],
  playbackGesturesIndecies: null,
  playbackTreeIter: null,
  playbackDelta: 0,
  playbackLastCurrentTime: 0,

  bgSize: initialBgSize,
  bgOffset: [0,0], 
  bgPic: slideInfoArray[0].pictfile 
};

const gestureReducer = (state = initialState, action) => {
  if (!state) return {};

  if ((isObject(action)) && ("payload" in action) && ("type" in action))
    switch (action.type) {
	  case 'SET_SPECIFIC_BACKGROUND_DIMENSIONS':
        if ( (Array.isArray(action.payload)) && (action.payload.length === 3) && (action.payload.every((element) => ((typeof element) === 'number'))) )
		{
			let tempSInfo = state.slideList2[action.payload[2]];
			if (tempSInfo){
				tempSInfo["width"] = action.payload[0];
				tempSInfo["height"] = action.payload[1];
			}
			if (action.payload[2] === state.currentSlideIndex2)
				state = {...state, bgSize: [action.payload[0], action.payload[1]]};
			else
				state = {...state};
		}
		break;
		case 'SET_BACKGROUND_OFFSET':
        if ( (Array.isArray(action.payload)) && (action.payload.length === 2) && (action.payload.every((element) => ((typeof element) === 'number'))) )
          state = {...state, bgOffset: action.payload};
        break;
	  case 'SET_CURRENT_GESTURE_INFO':
        if ( (Array.isArray(action.payload)) && (action.payload.length === 4) && (action.payload.every((element) => ((typeof element) === 'number'))) ){
		  let currentGestureTree = state.slideList2[state.currentSlideIndex2].gestureTree;
		  let gestureObj = currentGestureTree.get(state.currentGestureKey);
		  let gestureRect = gestureObj["ShowInfo"]; 
		  gestureRect.splice(0,4,action.payload[0],action.payload[1],action.payload[2],action.payload[3]);
		  state = {...state, gestureLocation: [action.payload[0], action.payload[1]], gestureSize: [action.payload[2], action.payload[3]]};
		}
		break;
	  case 'SET_GESTURE_TIMES':
		{
			let tempSInfo = state.slideList2[state.currentSlideIndex2];
			let newGestureTree = tempSInfo["gestureTree"];
			action.payload.forEach(function(subarray,index){
				let currentSubArray = this.oldState.gestureList2[index];
				let tempBoolArray = [currentSubArray[1] !== subarray[1], currentSubArray[0] !== subarray[0]];
				const boolreducer = (acc,cv) => {return ((acc*2) + (cv ? 1 : 0));};
				let bitmask = tempBoolArray.reduce(boolreducer,0);
				let oldGestureObj = (bitmask) ? newGestureTree.get(currentSubArray[0]) : null;
				let newGestureObj = null;
				let oldClearObj = null;
				let newClearObj = null;
				switch (bitmask){
					case 1: // change start time of gesture
						newGestureObj = {...oldGestureObj, Time: subarray[0]};
						if ("GestureClearTime" in oldGestureObj){
							oldClearObj = newGestureTree.get(oldGestureObj["GestureClearTime"]);
							oldClearObj["ClearInfo"] = subarray[0];
						}
						newGestureTree = newGestureTree.insert(subarray[0],newGestureObj);
						if (("ClearInfo" in oldGestureObj) === false)
							newGestureTree = newGestureTree.remove(oldGestureObj["Time"]);
						break;
					case 2: // change end time of gesture
						oldGestureObj["GestureClearTime"] = subarray[1];
						if ((currentSubArray[1] !== Infinity) && ((oldClearObj = newGestureTree.get(currentSubArray[1])) !== undefined) ){
							if ("ShowInfo" in oldClearObj)
								delete oldClearObj["ClearInfo"];
							else
								newGestureTree = newGestureTree.remove(oldClearObj["Time"]);
						} 
						newClearObj = {Time: subarray[1], ClearInfo: subarray[0]};
						newGestureTree = newGestureTree.insert(subarray[1],newClearObj);
						break;
					case 3:  // change both
						newGestureObj = {Time: subarray[0], GestureClearTime: subarray[1], ShowInfo: oldGestureObj["ShowInfo"]};
						newGestureTree = newGestureTree.insert(subarray[0],newGestureObj);
						if ("ClearInfo" in oldGestureObj){
							delete oldGestureObj["ShowInfo"];
							delete oldGestureObj["GestureClearTime"];
						} else
							newGestureTree = newGestureTree.remove(oldGestureObj["Time"]);
							
						if ((currentSubArray[1] !== Infinity) && ((oldClearObj = newGestureTree.get(currentSubArray[1])) !== undefined) ){
							if ("ShowInfo" in oldClearObj)
								delete oldClearObj["ClearInfo"];
							else
								newGestureTree = newGestureTree.remove(oldClearObj["Time"]);
						} 
						newClearObj = {Time: subarray[1], ClearInfo: subarray[0]};
						newGestureTree = newGestureTree.insert(subarray[1],newClearObj);
						break;
					default:
						break;
				}

			},{oldState: state});
			tempSInfo["gestureTree"] = newGestureTree;
			state = {...state, gestureList2: action.payload}; 
		}
		break;
      case 'CHANGE_GESTURE_WITHIN_CURRENT_BG':
		let currentGestureTree = state.slideList2[state.currentSlideIndex2].gestureTree;
		let newGestureIndex = parseInt(action.payload);
		let newGestureKey = state.gestureList2[newGestureIndex][0]; 
		let iter = currentGestureTree.find(newGestureKey);
		if (iter !== null){
			let gestureLoc = iter.value.ShowInfo.slice();
		  	let gestureSz = gestureLoc.splice(2,2);
			state = {...state, currentGestureKey: newGestureKey, currentGestureIndex: newGestureIndex, gestureLocation: gestureLoc, gestureSize: gestureSz};
        }
        break;
      case 'CHANGE_BG_SLIDE':
		let currentSlideInfo = state.slideList2[action.payload];
		if (currentSlideInfo !== undefined){
			let newGestureTree = currentSlideInfo.gestureTree;
			let newGestureTimes = [];
			let gestureLoc = null;
			newGestureTree.forEach((key,treeValue) => {
				let newTimes = [];
				if ("ShowInfo" in treeValue){
					newTimes.push(treeValue["Time"]);

					if (!gestureLoc)
						gestureLoc = treeValue["ShowInfo"].slice();

					if ("GestureClearTime" in treeValue)
						newTimes.push(treeValue["GestureClearTime"]);
					else
						newTimes.push(Infinity);

					newGestureTimes.push(newTimes);
				}
			});
			let gestureSz = gestureLoc.splice(2,2); 
			state = {...state,
			  currentSlideIndex2: action.payload,
			  gestureList2: newGestureTimes,
			  currentGestureKey: newGestureTimes[0][0],
			  currentGestureIndex: 0,
			  gestureSize: gestureSz,
			  gestureLocation: gestureLoc, 

			  bgSize: [currentSlideInfo.width, currentSlideInfo.height],
			  bgPic: currentSlideInfo.pictfile 
			};
        }
        break;
	  case 'INIT_PLAYBACK':
		let tempSInfo = state.slideList2[0];
		let firstGestureTree = tempSInfo["gestureTree"];
		state = {...state, 
					playbackGestures: [],
  					playbackTreeIter: firstGestureTree.begin,
					playbackGesturesIndecies: createTree(), 
  					playbackSlideURL: state.slideURLs[0],
					playbackSlideWidth: tempSInfo["width"], 
					playbackSlideHeight: tempSInfo["height"],
					playbackLastCurrentTime: 0
				};
		break;
	  case 'UPDATE_GESTURE_SHOW_LIST_DURING_PLAYBACK':

		let newPlaybackStatus = (action.payload >= state.playbackDuration) ? false : state.playbackIsPlaying;

		if ((state.playbackTreeIter) && (action.payload  >= state.playbackTreeIter.key)){
			let playbackObj = state.playbackTreeIter.value;
			let newPlaybackIndecies = state.playbackGesturesIndecies;
			let newGestures = state.playbackGestures.slice();
			if ("ShowInfo" in playbackObj){
				newGestures.push({ShowInfo: playbackObj["ShowInfo"].slice(), Time: playbackObj["Time"]});
				newPlaybackIndecies = newPlaybackIndecies.insert(playbackObj["Time"], newGestures.length - 1);
			}

			if ("ClearInfo" in playbackObj){
				let deleteIndex = newPlaybackIndecies.get(playbackObj["ClearInfo"]);
				if ("number" === (typeof deleteIndex)){
					newGestures.splice(deleteIndex,1);
					newPlaybackIndecies = newPlaybackIndecies.remove(playbackObj["ClearInfo"]);
				}
			}
			if (state.playbackTreeIter.hasNext){
				state.playbackTreeIter.next();
				state = {...state, 
							playbackGestures: newGestures, 
							playbackGesturesIndecies: newPlaybackIndecies,
							playbackIsPlaying: newPlaybackStatus}; 

			} else if ((state.playbackSlideIndex + 1) < state.slideList2.length){
				let tempSInfo = state.slideList2[state.playbackSlideIndex + 1];
				state = 
					{...state, 
					  playbackSlideURL: state.slideURLs[state.playbackSlideIndex + 1],
					  playbackSlideIndex: state.playbackSlideIndex + 1,
					  playbackSlideWidth: tempSInfo["width"],
					  playbackSlideHeight: tempSInfo["height"],
					  playbackGestures: [],
					  playbackGesturesIndecies: createTree(),
					  playbackTreeIter: tempSInfo["gestureTree"].begin,
					  playbackIsPlaying: newPlaybackStatus
					};
			} else 
				state = {...state, playbackGestures: newGestures, playbackTreeIter: null, playbackIsPlaying: newPlaybackStatus};
		} else 
			state = {...state, playbackIsPlaying: newPlaybackStatus};
		break;
	  case 'UPDATE_MEDIA_DURATION':
		state = {...state, playbackDuration: action.payload};
		break;
	  case 'SET_PLAYING_STATE':
		console.log("Inside set playing state case block");
		console.log("action.payback is " + action.payload);
		state = {...state, playbackIsPlaying: action.payload};
		break;
	  case 'DELETE_GESTURE_AT_INDEX':
		{
		let tempSInfo = state.slideList2[state.currentSlideIndex2];
        let newGestureTree = tempSInfo["gestureTree"];
		let currentGestureTimes = state.gestureList2[action.payload];
		let oldGestureObj = newGestureTree.get(currentGestureTimes[0]);
		if ("ClearInfo" in oldGestureObj){
			delete oldGestureObj["ShowInfo"];
			delete oldGestureObj["GestureClearTime"];
		} else 
			newGestureTree = newGestureTree.remove(oldGestureObj["Time"]);
		
		let oldClearObj = newGestureTree.get(currentGestureTimes[1]);
		if ("ShowInfo" in oldClearObj)
			delete oldClearObj["ClearInfo"]
		else
			newGestureTree = newGestureTree.remove(oldClearObj["Time"]);
		tempSInfo["gestureTree"] = newGestureTree;
		var dcopy = require('deep-copy');
		let newGestureList = dcopy(state.gestureList2);
		newGestureList.splice(state.currentGestureIndex,1);
		let newGestureIndex = ((state.currentGestureIndex >= newGestureList.length) ? (state.currentGestureIndex - 1) : state.currentGestureIndex);
		let newGestureObj = newGestureTree.get(newGestureList[newGestureIndex][0]);
		let gestureInfo = newGestureObj["ShowInfo"];
		state = {...state, currentGestureIndex: newGestureIndex, gestureList2: newGestureList, gestureLocation: [gestureInfo[0], gestureInfo[1]], gestureSize: [gestureInfo[2], gestureInfo[3]]};
		}
		break;
      default:
		console.log("Inside default reducer case and action type is " + action.type);
        state = {...state};
        break;
    } else {
		console.log("outside switch/case in reducer");
	}

  return state;
}
export default gestureReducer;


