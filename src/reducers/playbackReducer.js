
//import createTree from "functional-red-black-tree";
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
	let skipTree = slideMgr.slides[0].skipTree;

	let gestureIt = (gestureTree.length) ? gestureTree.begin : null;
	let clearIt = (clearTree.length) ? clearTree.begin : null;
	let skipIt = (skipTree.length) ? skipTree.begin : null;

	/*if ((gestureIt) && (gestureIt.key < slideMgr.playbackJumpTime)){
		gestureIt = gestureTree.le(slideMgr.playbackJumpTime);
		if (gestureIt.value.clearTime < slideMgr.playbackJumpTime)
			if (gestureIt.hasNext)
				gestureIt.next();
			else
				gestureIt = null;

		clearIt = (gestureIt) ? clearTree.find(gestureIt.value.clearTime) : null;
	}*/

	PlaybackManager.create({
		//currentPlaybackDisplayGestures: [], 
		currentPlaybackSlide: 0,
		currentPlaybackGestureIt: gestureIt,
		currentPlaybackClearIt: clearIt,
		currentPlaybackSkipIt: skipIt,
		currentPlaybackDisplayGestures: [],
		shouldSkip: false,
		skipTime: 0
	});
}

function UpdateGestureShowListDuringPlayback_Internal(session,payload)
{
	let {SlideManager, PlaybackManager} = session;
	let slideMgr = SlideManager.first();
	let playbackMgr = PlaybackManager.first();
	let {currentPlaybackGestureIt, currentPlaybackDisplayGestures, currentPlaybackClearIt, currentPlaybackSkipIt} = playbackMgr;
	let updatedGestures = false;

	if (playbackMgr.shouldSkip)
		playbackMgr.shouldSkip = false;

	if (payload >= slideMgr.playbackDuration){
		console.log("playback reached duration");
		slideMgr.playbackIsPlaying = false;
		slideMgr.currentPlaybackDisplayGestures = [];
		return;
	}
	if ((currentPlaybackGestureIt) && (payload >= currentPlaybackGestureIt.key)){
		let playbackObj = currentPlaybackGestureIt.value;

		console.log("adding gesture to display: startTime = " + playbackObj.startTime + " , clearTime = " + playbackObj.clearTime + " , at time = " + payload);
		//allow for easy filtering by having start and clear times as separate object properties in each array item
		currentPlaybackDisplayGestures.push({startTime: playbackObj.startTime, clearTime: playbackObj.clearTime, gesture: playbackObj});

		updatedGestures = true;

		if (currentPlaybackGestureIt.hasNext)
			currentPlaybackGestureIt.next();
		else
			currentPlaybackGestureIt = null;

		playbackMgr.currentPlaybackGestureIt = currentPlaybackGestureIt;
	}
	if ((currentPlaybackClearIt) && (payload >= currentPlaybackClearIt.key)){

		console.log("found clear event for time = " + currentPlaybackClearIt.key);
		// if I'm trimming the display array, ensure the copy in the display manager will be updated
		updatedGestures = updatedGestures || (currentPlaybackDisplayGestures.some((arrayItem) => {return arrayItem.clearTime <= currentPlaybackClearIt.key;}));  
		currentPlaybackDisplayGestures = currentPlaybackDisplayGestures.filter((arrayItem) => {return arrayItem.clearTime > currentPlaybackClearIt.key;});

		if (currentPlaybackClearIt.hasNext)
			currentPlaybackClearIt.next();
		else
			currentPlaybackClearIt = null;

		playbackMgr.currentPlaybackClearIt = currentPlaybackClearIt;
	}
	
	if ((currentPlaybackSkipIt) && (payload >= currentPlaybackSkipIt.key)){
		console.log("Detected skip range in playback");
		let currentSkipRangeObj = currentPlaybackSkipIt.value;
		console.log("skipTime = " + currentSkipRangeObj.skipTime + ", resumeTime = " + currentSkipRangeObj.resumeTime);

		// if I'm trimming the display array, ensure the copy in the display manager will be updated
		updatedGestures = updatedGestures || (currentPlaybackDisplayGestures.some((arrayItem) => {return arrayItem.clearTime < currentSkipRangeObj.resumeTime;})); 
		currentPlaybackDisplayGestures = currentPlaybackDisplayGestures.filter((arrayItem) => {return arrayItem.clearTime >= currentSkipRangeObj.resumeTime});

		let tempGTree = currentPlaybackGestureIt.tree;
		let tempIt = tempGTree.le(currentSkipRangeObj.resumeTime);

		if (tempIt){
			let tempGesture = tempIt.value;
			if (tempGesture){
				if ((tempGesture.startTime >= currentSkipRangeObj.skipTime) && (tempGesture.clearTime >= currentSkipRangeObj.resumeTime)){
					console.log("found possible gesture to add to display");
					console.log("startTime = " + tempGesture.startTime + ", clearTime = " + tempGesture.clearTime);
					updatedGestures = true;
					currentPlaybackDisplayGestures.push({startTime: tempGesture.startTime, clearTime: tempGesture.clearTime, gesture: tempGesture});
				} 
				if (tempIt.hasNext)
					tempIt.next();
				else
					tempIt = null;
				playbackMgr.currentPlaybackGestureIt = tempIt;
			}
		} else {
			console.log("did not find any possible gestures to add to display");

			playbackMgr.currentPlaybackGestureIt = tempGTree.ge(currentSkipRangeObj.resumeTime);
		}
		if (currentPlaybackSkipIt.hasNext)
			playbackMgr.currentPlaybackSkipIt.next();
		else
			playbackMgr.currentPlaybackSkipIt = null;

		playbackMgr.currentPlaybackClearIt = currentPlaybackClearIt.tree.ge(currentSkipRangeObj.resumeTime);
		playbackMgr.shouldSkip = true;
		playbackMgr.skipTime = currentSkipRangeObj.resumeTime;
	}

	if (updatedGestures){
		console.log("updating gestures array at time = " + payload);
		playbackMgr.currentPlaybackDisplayGestures = ((currentPlaybackDisplayGestures.length) ? currentPlaybackDisplayGestures.slice() : []);
		console.log("display list contains " + playbackMgr.currentPlaybackDisplayGestures.length + " gesture(s)");
		console.log(" ");
	} 
}

const playbackReducer = (dbState, action) => {
	if (!dbState) return {};
	if (action.type.search(/redux\/INIT/) !== -1){
		return dbState;
	}
	
	const sess = orm.session(dbState);

	if ((isObject(action)) && ("payload" in action) && ("type" in action)){
		const {SlideManager} = sess;
		let slideMgr = SlideManager.first();

		switch (action.type) {
		  case 'INIT_PLAYBACK':
			InitPlayback_Internal(sess);
			break;
		  case 'SET_PLAYING_STATE':
			slideMgr.playbackIsPlaying = action.payload;
			break;
		  case 'UPDATE_GESTURE_SHOW_LIST_DURING_PLAYBACK':
			UpdateGestureShowListDuringPlayback_Internal(sess,action.payload);
			break;
		  default:
			break;
		}
	}

	return sess.state;
}
export default playbackReducer;


