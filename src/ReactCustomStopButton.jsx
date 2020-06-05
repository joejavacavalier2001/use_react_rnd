import React, {useCallback} from 'react';
import { withMediaProps } from 'react-media-player';
import Button from 'react-bootstrap/Button';

const ReactCustomStopButton = (props) => {

	let handleOnClick = useCallback((e) => {
		e.preventDefault();
		e.currentTarget.blur();
		props.media.seekTo(0);
		props.media.stop();
		if ((props.setPlayingState) && ("function" === typeof props.setPlayingState))
			props.setPlayingState(false);
	},[props]);
    return (
		<>
			{(props.media.isPlaying) && (<Button variant="primary" onClick={handleOnClick}>Stop</Button>)}
		</>
	);
};

export default withMediaProps(ReactCustomStopButton);

