import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {fetch} from 'redux';
import _ from 'lodash';
import {createTask, removeBusy} from 'actions/index';
import composeWizard from 'composers/wizard';
import Day from './day';
import {filterTasksForUser} from 'helpers/index';
import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import CheckUncheckTaskPopup from '../modals/checkUncheckTaskPopup'
import OpenTasksFromPastPopup from '../modals/openTasksFromPastPopup'
import ActionBar from '../components/actionBar'
import {makeGetTasksForDay, getForgottenTasksFromPast} from 'selectors/tasksDaySelector';
import AssignUsersStep from '../modals/addEditTaskWizardSteps/assignUsersStep'
import ChooseTypeStep from '../modals/addEditTaskWizardSteps/chooseTypeStep'
import DefineContentStep from '../modals/addEditTaskWizardSteps/defineContentStep'
import SetTimingStep from '../modals/addEditTaskWizardSteps/setTimingStep'
import toastr from 'toastr';
import DatePicker from 'material-ui/DatePicker';
import ReactDOM from 'react-dom'
import {getUsersOnVacation} from 'selectors/usersOnVacationSelector';
import {GT_dialogStyles} from 'helpers/index';
import cN from 'classnames';
import './styles.scss';
import DaysTransitionGroup from './daysTransitionGroup';
import DayHead from './head'

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		createTask,
		removeBusy
	}, dispatch);
};

const mapStateToProps = (state, props) => {
	let forgottenTasksFromPast = getForgottenTasksFromPast(state.data.tasks, Date.create("heute").iso(), state.core.selectedBranch, getUsersOnVacation(state))
	return {
		forgottenTasksFromPast: (props.user
			? filterTasksForUser(forgottenTasksFromPast, props.user)
			: forgottenTasksFromPast),
		users: state.data.users,
		selectedBranch: state.core.selectedBranch
	};
};

@connect(mapStateToProps, mapDispatchToProps)
export default class Tasks extends Component {
	constructor(props) {
		super(props);
		let today = Date.create().iso()
		this.state = {
			today: today,
			centerDay: today,
			daysInPast: 0,
			daysInFuture: 0,
			checkUncheckTaskPopupIsOpen: false,
			addEditTaskWizardIsOpen: false,
			adminWantsOnlyHisStuff: true
		};
	}

	openCheckUncheckTaskPopup = (task, isInFuture) => {
		console.log(task)
		this.checkUncheckTaskPopup = (<CheckUncheckTaskPopup
			creator={(this.props.users.find(u => u.ID == task.creatorID))
			? (this.props.users.find(u => u.ID == task.creatorID)).name
			: "[Nutzer gelöscht]"}
			data={task}
			isInFuture={isInFuture}
			close={this.closeCheckUncheckTaskPopup}
			user={this.props.user
			? this.props.user
			: null}/>)
		this.setState({checkUncheckTaskPopupIsOpen: true});
	}

	closeCheckUncheckTaskPopup = () => {
		this.setState({checkUncheckTaskPopupIsOpen: false});
	}

	openAddEditTaskWizard = () => {
		this.setState({addEditTaskWizardIsOpen: true});
		let Wizard = composeWizard([ChooseTypeStep, SetTimingStep, DefineContentStep, AssignUsersStep]);
		this.addEditTaskWizard = (<Wizard
			creatorID={this.props.user.ID}
			close={this.closeAddEditTaskWizard}
			onFinish={this.addTask}
			selectedBranch={this.props.selectedBranch}/>)
	}

	addTask = (taskData) => {
		return this.props.createTask(taskData);
	}

	closeAddEditTaskWizard = () => {
		this.setState({addEditTaskWizardIsOpen: false});
	}

	jumpToToday = () => {
		if (!Date.create(this.state.centerDay).isSameDateAs(Date.create())) {
			const today = Date.create();
			this.setState({
				movingDayBackward: today.isBefore(this.state.centerDay),
				centerDay: today.iso()
			});
		}
	}

	jumpAndScrollToDate = (d) => {
		const newCenterDay = d;
		this.setState({
			movingDayBackward: newCenterDay.isBefore(this.state.centerDay),
			centerDay: newCenterDay.iso()
		});
	}

	renderDays = () => {
		const days = [this.state.centerDay];
		let daysInPastRange = _.range(1, this.state.daysInPast + 1)
		let daysInFutureRange = _.range(1, this.state.daysInFuture + 1)
		// add Days for the future AND the past
		daysInFutureRange.forEach(i => days.push(Date.create(this.state.centerDay).addDays(i).iso()));
		daysInPastRange.forEach(i => days.push(Date.create(this.state.centerDay).addDays(-i).iso()));
		let taskDays = days.map(d => ({day: d}));
		let today = Date.create()
		return taskDays.sortBy((d) => Date.create(d.day)).map(td => {
			const taskIsToday = Date.create(td.day).isSameDateAs(today)
			return (<Day
				user={this.props.user}
				key={td.day}
				day={td.day}
				isFullWidthDay={!this.state.daysInFuture && !this.state.daysInPast}
				forgottenTasksFromPast={taskIsToday ? this.props.forgottenTasksFromPast : null}
				selectedBranch={this.props.selectedBranch}
				openCheckUncheckTaskPopup={this.openCheckUncheckTaskPopup}
				selectedBranch={this.props.selectedBranch}/>);
		});
	}

	moveCenterDay = (i) => {
		const newCenterDay = Date.create(this.state.centerDay).addDays(i);
		this.setState({
			movingDayBackward: newCenterDay.isBefore(this.state.centerDay),
			centerDay: newCenterDay.iso()
		});
	}

	render() {
		const user = this.props.user
		const userColor = user && user.color;
		const currentDayIsToday = Date.create(this.state.centerDay).isSameDateAs(Date.create())
		const isFuture = !currentDayIsToday && Date.create(this.state.centerDay).isAfter(Date.create())
		return (
			<content className="calendar">
				<fb className="daysWrapper">
					<DayHead
						user={this.props.user}
						onPagingHandler={this.moveCenterDay}
						forgottenTasksFromPast={this.props.forgottenTasksFromPast}
						openCheckUncheckTaskPopup={this.openCheckUncheckTaskPopup}
						isToday={currentDayIsToday}
						date={Date.create(this.state.centerDay)}
						isFuture={isFuture}
						jumpToToday={this.jumpToToday}
						jumpToDate={() => this.refs.jumpToDatePicker.openDialog()}/>
					<DaysTransitionGroup movingDirection={this.state.movingDayBackward}>
						{this.renderDays()}
					</DaysTransitionGroup>
				</fb>
				<ActionBar user={user} openAddEditTaskWizard={this.openAddEditTaskWizard} />
				<DatePicker style={{"display": "none"}} ref='jumpToDatePicker'
					onChange={(e, d) => {if (!(typeof d === 'string' || d instanceof String)) this.jumpAndScrollToDate(d)}}
					floatingLabelText="asd"
					cancelLabel="Abbrechen"
					autoOk={true}
					DateTimeFormat={window.DateTimeFormat}
					locale="de-DE"/>
				<Dialog style={{zIndex: 900}}
					className="materialDialog"
					contentStyle={GT_dialogStyles}
					open={this.state.checkUncheckTaskPopupIsOpen}
					onRequestClose={this.closeCheckUncheckTaskPopup}
					children={this.checkUncheckTaskPopup} />
				<Dialog
					className="materialDialog addEditTaskWizard"
					contentStyle={GT_dialogStyles}
					open={this.state.addEditTaskWizardIsOpen}
					onRequestClose={this.closeAddEditTaskWizard}
					children={this.addEditTaskWizard} />
			</content>
		);
	}
}
