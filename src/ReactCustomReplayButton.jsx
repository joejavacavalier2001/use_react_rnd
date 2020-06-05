import React, {useCallback} from 'react';
import { withMediaProps } from 'react-media-player';
import Button from 'react-bootstrap/Button';

const ReactCustomReplayButton = (props) => {

	let handleOnClick = useCallback((e) => {
		e.preventDefault();
		e.currentTarget.blur();
		props.media.seekTo(0);
		props.media.play();
		if ((props.setPlayingState) && ("function" === typeof props.setPlayingState))
			props.setPlayingState(true);
	},[props]);
    return (
		<Button variant="primary" onClick={handleOnClick}>Restart</Button>
    );
};
export default withMediaProps(ReactCustomReplayButton);

