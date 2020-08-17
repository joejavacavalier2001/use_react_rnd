import React, {useCallback,useMemo} from 'react';
import {DuxDialog} from 'duxpanel';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import '../node_modules/duxpanel/website/dist/duxpanel.css';

const DeleteConfirmDialog = (props) => {

	let handleCancel = useCallback(() => {props.dialogCallback(false)},[props]);
	let handleConfirmDelete = useCallback(() => {props.dialogCallback(true)},[props]);
	let startTime = useMemo(() => {return ((props.skipDialog) ? props.currentSkipTimes[0] : props.currentGestureTimes[0]);},[props]);
	let endTime = useMemo(() => {return ((props.skipDialog) ? props.currentSkipTimes[1] : props.currentGestureTimes[1]);},[props]);
	let objName = useMemo(() => {return ((props.skipDialog) ? "skip range" : "gesture");},[props]);
	return (
		<DuxDialog show={props.show} onClose={handleCancel} title="Confirm gesture deletion" onEscPressed={handleCancel}>
			<Container fluid>
				<Row>
					<Col>
					<h3>Are you sure you want to delete the current {objName}?</h3>
					<p>The current {objName} starts at {startTime} seconds and disappers at {endTime} seconds.</p>
					</Col>
				</Row>
				<Row>
					<Col md={4} />
					<Col md="auto"><Button variant="danger" onClick={handleConfirmDelete}>Delete {objName}</Button></Col>
					<Col md="auto"><Button variant="primary" onClick={handleCancel}>Cancel</Button></Col>
				</Row>
			</Container>
		</DuxDialog>
	);
};

export default DeleteConfirmDialog;
