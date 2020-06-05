import React from 'react';
import DragM from 'dragm';
import DeleteConfirmDialogContent from "./DeleteConfirmDialogContent";

const DeleteConfirmDialog = (props) => {

	return (
			<DragM>
				<DeleteConfirmDialogContent {...props} />
			</DragM>
	);
};

export default DeleteConfirmDialog;
