import { createSelector } from 'redux-orm';
import {OrmManager} from "./models";
var orm = OrmManager.orm;

// ************************************************************************************************
// use selectors to avoid duplicating pieces of information in different places in the state object!
//
// One major advantage to using selectors, I can read these parts of the "state" and 
// it will automatically update from the other parts of the data structure
// ************************************************************************************************

const gestureList2 = createSelector(
	orm,
	session => {
		let slideMgr = session.SlideManager.first();
		let {slides, currentSlide} = slideMgr;
		let rawGestures = slides[currentSlide].gestureTree.values;
		return rawGestures.map((gestureObj) => {return [gestureObj.startTime, gestureObj.clearTime];});
	}
);

const slideURLs = createSelector(
	orm,
	session => {
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

export {
	gestureList2, 
	slideURLs, 
	slideNameList, 
	currentSlide,
	bgSize, 
	bgPic, 
	currentEditingGesture,
	currentGestureIndex, 
	currentGestureKey, 
	slideInfo,
	playbackSlideInfo,
	playbackGestures,
	playbackDuration,
	playbackIsPlaying,
	combinedPlaybackStatus
};
