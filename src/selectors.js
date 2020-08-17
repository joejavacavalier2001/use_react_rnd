import { createSelector } from 'redux-orm';
import orm from "./models";

// ************************************************************************************************
// use selectors to avoid duplicating pieces of information in different places in the state object!
//
// One major advantage to using selectors, I can read these parts of the "state" and 
// it will automatically update from the other parts of the data structure
// ************************************************************************************************

const whichAsychronousDialogs = createSelector(
	orm,
	session => {
		let asychArray = session.SlideManager.first().showAsynchronousDialogs;
		let index = asychArray.lastIndexOf(true);
		let returnValue = "none";
		switch(index){
			case 0:
				returnValue = "pending";
				break;
			case 1:
				returnValue = "fulfilled";
				break;
			case 2:
				returnValue = "rejected";
				break;
			default:
				returnValue = "none";
				break;
			}
		return returnValue; 
	}
);

const gestureList2 = createSelector(
	orm,
	session => {
		let slideMgr = session.SlideManager.first();
		let {slides, currentSlide} = slideMgr;
		let rawGestures = slides[currentSlide].gestureTree.values;
		return rawGestures.map((gestureObj) => {return [gestureObj.startTime, gestureObj.clearTime];});
	}
);

const skipRanges = createSelector(
	orm,
	session => {
		let slideMgr = session.SlideManager.first();
		let {slides, currentSlide} = slideMgr;
		let rawSkipRanges = slides[currentSlide].skipTree.values;
		return rawSkipRanges.map((skipRangeObj) => {return [skipRangeObj.skipTime, skipRangeObj.resumeTime];});
	}
);

const skipTimeInfo = createSelector(
	orm,
	session => {
		if (session.PlaybackManager.count()){
			let playbackMgr = session.PlaybackManager.first();
			return {shouldSkip: playbackMgr.shouldSkip, skipTime: playbackMgr.skipTime};
		} else {
			return {shouldSkip: false, skipTime: 0};
		}
	}
);


const slideURLs = createSelector(
	orm,
	(session) => {
		if (!session.SlideManager.count()){
			alert("bad selector"); 
			return null;
		}
		let slideMgr = session.SlideManager.first();
		return slideMgr.slides.map((slideObj) => {return slideObj.pictfile;});
	}
);

const slideNameList = createSelector(
	orm,
	session => {
		let slideMgr = session.SlideManager.first();
		return slideMgr.slides.map((slideObj) => {
			let a = slideObj.pictfile.split("/");
			return a[a.length-1];
		});
	}
);

const currentSlide = createSelector(
	orm,
	session => {
		let slideMgr = session.SlideManager.first();
		return slideMgr.currentSlide;
	}
);

const bgSize = createSelector(
	orm,
	session => {
		let slideMgr = session.SlideManager.first();
		let {slides, currentSlide} = slideMgr;
		return [slides[currentSlide].width, slides[currentSlide].height];
	}
);

const bgPic = createSelector(
	orm,
	session => {
		let slideMgr = session.SlideManager.first();
		return slideMgr.slides[slideMgr.currentSlide].pictfile;
	}
);

const currentEditingGesture = createSelector(
	orm,
	session => {
		let slideMgr = session.SlideManager.first();
		let {slides, currentSlide, currentGestureIndex} = slideMgr;
		let gestureTree = slides[currentSlide].gestureTree;
		if (gestureTree.length)
			return slides[currentSlide].gestureTree.at(currentGestureIndex).value;

		return 0;
	}
);

const currentGestureIndex = createSelector(
	orm,
	session => {
		let slideMgr = session.SlideManager.first();
		return slideMgr.currentGestureIndex;
	}
);

const currentSkipIndex = createSelector(
	orm,
	session => {
		let slideMgr = session.SlideManager.first();
		return slideMgr.currentSkipIndex;
	}
);

const currentGestureKey = createSelector(
	orm,
	session => {
		let slideMgr = session.SlideManager.first();
		return slideMgr.currentGestureKey;
	}
);

const slideInfo = createSelector(
	orm,
	session => {
		let slideMgr = session.SlideManager.first();
		let slide = slideMgr.slides[slideMgr.currentSlide];
		return {pictfile: slide.pictfile, width: slide.width, height: slide.height};
	}
);

const playbackSlideInfo = createSelector(
	orm,
	session => {
		if (session.PlaybackManager.count() === 0)
			return {pictfile: "", width: 0, height: 0};

		let slideMgr = session.SlideManager.first();
		let playbackMgr = session.PlaybackManager.first();
		let slide = slideMgr.slides[playbackMgr.currentPlaybackSlide];
		return {pictfile: slide.pictfile, width: slide.width, height: slide.height};
	}
);

const playbackIsPlaying = createSelector(
	orm,
	session => {
		let slideMgr = session.SlideManager.first();
		return slideMgr.playbackIsPlaying;
	}
);

const playbackDuration = createSelector(
	orm,
	session => {
		let slideMgr = session.SlideManager.first();
		return slideMgr.playbackDuration;
	}
);

const playbackGestures = createSelector(
	orm,
	session => {
		if (session.PlaybackManager.count() === 0) 
			return [];

		let playbackMgr = session.PlaybackManager.first();
		return playbackMgr.currentPlaybackDisplayGestures;
	}
);

const combinedPlaybackStatus = createSelector(
	orm,
	session => {
		let slideMgr = session.SlideManager.first();
		return {playbackDuration: slideMgr.playbackDuration, playbackIsPlaying: slideMgr.playbackIsPlaying};
	}
);

const playbackJumpTime = createSelector(
	orm,
	session => {
		let slideMgr = session.SlideManager.first();
		return slideMgr.playbackJumpTime;
	}
);

export {
	gestureList2,
	skipRanges,
	slideURLs, 
	slideNameList, 
	currentSlide,
	bgSize, 
	bgPic, 
	currentEditingGesture,
	currentGestureIndex, 
	currentSkipIndex,
	currentGestureKey, 
	slideInfo,
	playbackSlideInfo,
	playbackGestures,
	playbackDuration,
	playbackIsPlaying,
	combinedPlaybackStatus,
	playbackJumpTime,
	whichAsychronousDialogs,
	skipTimeInfo
};
