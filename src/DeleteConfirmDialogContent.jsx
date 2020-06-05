import React, {useImperativeHandle, useRef, useCallback} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const DeleteConfirmDialogContent = React.forwardRef((props,ref) => {

	let handleCancel = useCallback(() => {props.dialogCallback(false)},[props]);
	let handleConfirmDelete = useCallback(() => {props.dialogCallback(true)},[props]);
	let inputRef = useRef(null);
  useImperativeHandle(ref, () => (
 {
    addEventListener : (t,l) => {inputRef.current._modal.dialog.firstElementChild.addEventListener(t,l);},
    removeEventListener : (t,l) => {inputRef.current._modal.dialog.firstElementChild.removeEventListener(t,l);},
    style : inputRef.current._modal.dialog.firstElementChild.style
  }
  ));
	return (
			<Modal ref={inputRef} show={props.show} onHide={handleCancel}>
				<Modal.Header closeButton>
					<Modal.Title>Confirm gesture deletion</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<h3>Are you sure you want to delete the current gesture?</h3>
					<p>The current gesture starts at {props.currentGestureTimes[0]} seconds and disappers at {props.currentGestureTimes[1]} seconds.</p>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="danger" onClick={handleConfirmDelete}>Delete Gesture</Button>
					<Button variant="primary" onClick={handleCancel}>Cancel</Button>
				</Modal.Footer>
			</Modal>
	);
});

export default DeleteConfirmDialogContent;
