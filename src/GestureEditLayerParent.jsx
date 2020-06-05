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
import GestureTimeSliderParent from "./GestureTimeSliderParent";
import {playbackDuration, slideURLs} from "./selectors";

const GestureEditLayerParent = (props) => {
  let preloadedImages = props.slideURLs.map((url,index) => {
	return (<PreloadedImage src={url} key={index} index={index} />);
  });
  return (
      <Container fluid>
	  	<Row>
	  		<Col bsPrefix="preloadedImages">{preloadedImages}</Col>
		</Row>
	  
	  	<Row>
	  		<Col>
	  			<Row> 
	  				<Col> 
	  					<ReactMediaWrapper /> 
	  					<h1>Gesture Player</h1>
	  					<GesturePlayback />
	  				</Col> 
	  			</Row>
	  		</Col>

	  		<Col>
	  			<Row> <Col> <h1>Gesture Editor</h1> </Col> </Row>
	  			<Row> <Col> <GesturePicker /> </Col> </Row>
	  			<Row> <Col> <GestureTimeSliderParent decimalPlaces={2} /> </Col> </Row>
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
