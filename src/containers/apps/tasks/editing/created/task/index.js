import React, {Component} from 'react'
import {connect} from 'react-redux';
import cN from 'classnames';
import AssignedUsers from 'components/assignedUsers';
import MiniUser from 'components/miniUser';
import _ from 'lodash';
import {getUserById, getTypeAndPatternOfTask} from 'helpers/index';
import RaisedButton from 'material-ui/RaisedButton';
import {TaskType} from '../../../modals/addEditTaskWizardSteps/constants'
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import './styles.scss';


//@param task 	obj
//@param today 	dateObj
//@param openTaskDetailsPopup func(task obj)

const EditCreatedTask = (props) => {
	const t = props.task
	const creator = props.users.find( u => t.creatorID == u.ID)
	const creationDate = Date.create(t.creationDate).format('{dd}/{MM}/{yy}');
	const taskTypeAndPattern = getTypeAndPatternOfTask(t);

	const doneOrEnded = props.isDone || props.hasEnded
	const myReplacementSet = t.replacements && t.replacements[props.user.ID]
	const replacementSelectedStyle = { backgroundColor: props.user.color, borderColor: props.user.color, color: 'white' }

	const onTaskClicked = () => {
		console.log("clicked")
		props.openTaskDetailsPopup(t, doneOrEnded);
	}

	function shouldComponentUpdate(nextProps,nextState){

	}

	console.log("rendering editorTask listItem")

	return (
		<fb className={cN({"taskRow":true, "ghostRow": doneOrEnded })} onClick={ onTaskClicked }>
			<fb className="creator" style={{color: doneOrEnded ? '#afafaf' : creator.color }}>{creator.nameInitials}</fb>
			<fb className="taskInfo">
				<fb className="taskTitle">{t.subject}</fb>
				{ props.isDone ? <fb className="isDoneTag">erledigt</fb> : null }
				{ props.hasEnded ? <fb className="hasEndedTag">beendet</fb> : null }
			</fb>
			<fb className="assignedUsers">
				<AssignedUsers
					assignedUsers={t.assignedUsers}
					maxDisplayedMiniUsers={4}
					colorStyle={ doneOrEnded ? 'blackAndWhite' : null }
				/>
			{ t.assignedUsers[props.user.ID] ? <icon className="icon-account_circle" style={ myReplacementSet ? replacementSelectedStyle : null }></icon>: null }
			</fb>
			<fb className="taskType">{taskTypeAndPattern.type}</fb>
			<fb className="creationDate">{creationDate}</fb>
		</fb>
	)
}

export default EditCreatedTask
