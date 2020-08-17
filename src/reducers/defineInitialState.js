
import createTree from "functional-red-black-tree";
import orm from "../models";
var mainArray = window.myslides;

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

var initialSlideMgr = SlideManager.create({slides: [], currentSlide: 0, currentPlaybackSlide: 0, playbackDuration: 0, playbackIsPlaying: false, currentGestureIndex: 0, playbackJumpTime: 0, 
											showAsynchronousDialogs: [false, false, false], valueAsynchronousDialog: 0});

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

		currentSlide = Slide.create({pictfile: prefix + pfile, width: 0, height: 0, skipTree: createTree()});
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
export const initialState = session.state;

