import React from 'react';
import GestureEditLayer from "./GestureEditLayer";
import GesturePicker from "./GesturePicker";
import PreloadedImage from "./PreloadedImage";
import {connect} from "react-redux";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ReactMediaWrapper from "./ReactMediaWrapper";
import GesturePlayback from "./GesturePlayback";
import GestureSliderParent from "./GestureSliderParent";
import {playbackDuration, slideURLs} from "./selectors";
import ShowTriggerAsychAction from "./ShowTriggerAsychAction";
import ReactGoogleLoginWrapper from "./ReactGoogleLoginWrapper";
import ReactGoogleResponse from "./ReactGoogleResponse";

const GestureEditLayerParent = (props) => {
  let preloadedImages = props.slideURLs.map((url,index) => {
	return (<PreloadedImage src={url} key={index} index={index} />);
  });

  return (
      <Container fluid>
	  	<Row>
	  		<Col bsPrefix="hiddenColumn">{preloadedImages}</Col>
		</Row>

	  	<Row>
	  		<Col bsPrefix="centerHeader">
	  			<h2> TorahTechnologies.org </h2>
	  			<h3>DafBoard Multi-Sensory Presentation</h3>
	  		</Col>
	  	</Row>
	  	{/*This block of elements allow the triggering of a fake asychronous action */}
		<Row><Col><ShowTriggerAsychAction /></Col></Row>
		<Row><Col><ReactGoogleLoginWrapper /></Col></Row>	    
		<Row><Col><ReactGoogleResponse /></Col></Row>	    

	  	<Row>
	  		<Col>
	  			<Row> 
	  				<Col> 
	  					<h1>Gesture Player</h1>
	  					<p>Please edit the gestures on the right side of this screen and</p>
	  					<p>click on the Restart button to see the gestures appear during the media playback.</p>
	  					<ReactMediaWrapper /> 
	  					<GesturePlayback />
	  				</Col> 
	  			</Row>
	  		</Col>

	  		<Col>
	  			<Row> <Col> <h1>Gesture Editor</h1> </Col> </Row>
	  			<Row> <Col> <GesturePicker /> </Col> </Row>
	  			<Row> <Col> <GestureSliderParent decimalPlaces={2} /> </Col> </Row>
	  			<Row> <Col> <GestureEditLayer /> </Col> </Row>
	  		</Col>
	  	</Row>
      </Container>
  );
}
const mapStateToProps = (state) => {
  return {
	  slideURLs: slideURLs(state), //state.currentGesture.slideURLs,
	  playbackDuration: playbackDuration(state) //state.currentGesture.playbackDuration
  };
};

export default connect(mapStateToProps)(GestureEditLayerParent);
