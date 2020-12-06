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

class SkipRange extends Model {}
SkipRange.fields = {
	skipTime: attr(),
	resumeTime: attr()
};
SkipRange.modelName = "SkipRange";

class Slide extends Model {}
Slide.fields = {
	pictfile: attr(),
	width: attr(),
	height: attr(),
	gestureTree: attr(),
	clearTree: attr(),
	skipTree: attr()
};
Slide.modelName = "Slide";

class SlideManager extends Model {}
SlideManager.fields = {
	slides: attr(),
	currentSlide: attr(),
	currentGestureKey: attr(),
	currentGestureIndex: attr(),
	currentSkipKey: attr(),
	currentSkipIndex: attr(),
	playbackDuration: attr(),
	playbackIsPlaying: attr(),
	playbackJumpTime: attr(),
	showAsynchronousDialogs: attr(),
	valueAsychronousDialog: attr()
};
SlideManager.modelName = "SlideManager";

class PlaybackManager extends Model {}
PlaybackManager.fields = {
	currentPlaybackGestureIt: attr(),
	currentPlaybackClearIt: attr(),
	currentPlaybackDisplayGestures: attr(),
	currentPlaybackSlide: attr(),
	playbackGestureTree: attr(),
	currentPlaybackSkipIt: attr(),
	shouldSkip: attr(),
	skipTime: attr()
};
PlaybackManager.modelName = "PlaybackManager";

class LoginManager extends Model {}
LoginManager.fields = {
	googleLoginResponseObj: attr(),
	serverErrorTxt: attr(),
	serverTestResponse: attr(),
};
LoginManager.modelName = "LoginManager";

var orm = new ORM({stateSelector: state => state});
orm.register(SlideManager,Slide,Gesture,ClearObj,PlaybackManager,SkipRange,LoginManager);
export default orm;
export {SlideManager, Slide, Gesture, ClearObj};


