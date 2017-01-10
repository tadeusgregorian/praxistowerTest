import RaisedButton from 'material-ui/RaisedButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import React, {Component, PropTypes} from 'react';
import FontIcon from 'material-ui/FontIcon';
import ContentAdd from 'material-ui/svg-icons/content/add';

export default (props) => {
	const addTaskButton = props.user ?
		(<FloatingActionButton onClick={props.openAddEditTaskWizard}>
			<ContentAdd />
		</FloatingActionButton>) : null;
	return (
		<fb className="bottomButtonBar">
			{addTaskButton}
		</fb>
	)
}
