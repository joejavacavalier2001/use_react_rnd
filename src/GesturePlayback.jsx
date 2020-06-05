import React from 'react';
import {connect} from "react-redux";
import GestureRuntimeGroup from "./GestureRuntimeGroup";
import {playbackSlideInfo,playbackIsPlaying} from "./selectors"; 

const GesturePlayback = (props) => {
  let containerStyles = (props.playbackIsPlaying) ? {
      width: props.playbackSlideWidth,
      height: props.playbackSlideHeight,
      border: '1px solid black', 
      background: 'url("' + props.playbackSlideURL + '")'
  } : {};
  return (
  	<div id="GesturePlayback" style={containerStyles}>
		<GestureRuntimeGroup />
	</div>
  );
}; // end GesturePlayback

const mapStateToProps = (state) => {
  let slideInfo = playbackSlideInfo(state);
  return {
	playbackIsPlaying: playbackIsPlaying(state),
  	playbackSlideURL: slideInfo.pictfile,
  	playbackSlideWidth: slideInfo.width, 
  	playbackSlideHeight: slideInfo.height 
  };
};
export default connect(mapStateToProps)(GesturePlayback);
