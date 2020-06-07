import { Model,ORM,attr } from 'redux-orm';

class ClearObj extends Model {}
ClearObj.fields = {
	startTime: attr(),
	gestureTime: attr()
};
ClearObj.modelName = "ClearObj";

class Gesture extends Model {}
Gesture.fields = {
	location: attr(),
	dimensions: attr(),
	startTime: attr(),
	clearTime: attr(),
	slideNumber: attr()
};
Gesture.modelName = "Gesture";

class Slide extends Model {}
Slide.fields = {
	pictfile: attr(),
	width: attr(),
	height: attr(),
	gestureTree: attr(),
	clearTree: attr()
};
Slide.modelName = "Slide";

class SlideManager extends Model {}
SlideManager.fields = {
	slides: attr(),
	currentSlide: attr(),
	currentGestureKey: attr(),
	currentGestureIndex: attr(),
	playbackDuration: attr(),
	playbackIsPlaying: attr(),
	playbackJumpTime: attr()
};
SlideManager.modelName = "SlideManager";

class PlaybackManager extends Model {}
PlaybackManager.fields = {
	currentPlaybackGestureIt: attr(),
	currentPlaybackClearIt: attr(),
	currentPlaybackDisplayGestures: attr(),
	currentPlaybackSlide: attr(),
	playbackGesturesIndecies: attr()
};
PlaybackManager.modelName = "PlaybackManager";

var orm = new ORM({stateSelector: state => state.orm});
orm.register(SlideManager,Slide,Gesture,ClearObj,PlaybackManager);
export function OrmManager() {}
OrmManager.orm = orm;
//export {SlideManager, Slide, Gesture, ClearObj};


