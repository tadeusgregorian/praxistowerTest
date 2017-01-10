import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetch } from 'redux';
import _ from 'lodash';
import { createTask, editTask} from 'actions/index';
import composeWizard from 'composers/wizard';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Dialog from 'material-ui/Dialog';
import ContentAdd from 'material-ui/svg-icons/content/add';
import CheckUncheckTaskPopup from '../modals/checkUncheckTaskPopup'
import cN from 'classnames'
import AssignUsersStep from '../modals/addEditTaskWizardSteps/assignUsersStep'
import ChooseTypeStep from '../modals/addEditTaskWizardSteps/chooseTypeStep'
import DefineContentStep from '../modals/addEditTaskWizardSteps/defineContentStep'
import SetTimingStep from '../modals/addEditTaskWizardSteps/setTimingStep'
import {TaskType} from '../modals/addEditTaskWizardSteps/constants'
import toastr from 'toastr';
import { GT_dialogStyles } from 'helpers/index';
import DeleteTaskPopup from '../modals/deleteTaskPopup'
import { getUserById } from 'helpers/index';
import Toggle from 'material-ui/Toggle';
import LazyLoad from 'react-lazyload';
import EditCreatedTasks from './created'
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { Link } from 'react-router';
import './styles.scss'

export default class TasksEdit extends React.Component {

	render() {
		const {user} = this.props

		// On initial loading this.props.user is Undefined.
		// Thats why we check first if user is existent in the returnJSX and create ChildComponent after that.

		return(
			<fb className="taskEditWrapper">
				<fb className="tasksEdit">
					{ user ? <fb>{React.cloneElement(this.props.children, {user})}</fb> : null }
				</fb>
			</fb>
		)
	}
}
