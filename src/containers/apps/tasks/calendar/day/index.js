import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import cN from 'classnames';
import _ from 'lodash';
import {getUserById, filterTasksForUser, formatHourAndMinute, playTaskCheckSound} from 'helpers/index';
import {checkTaskStatic, uncheckTask} from 'actions/index';
import shallowCompare from 'react-addons-shallow-compare';
import {makeGetTasksForDay, getForgottenTasksFromPast} from 'selectors/tasksDaySelector';
import {getUsersOnVacation} from 'selectors/usersOnVacationSelector';
import Checkbox from 'material-ui/Checkbox';
import TransitionGroup from 'react-addons-css-transition-group';
import toastr from 'toastr';
import Dialog from 'material-ui/Dialog';
import {GT_dialogStyles} from 'helpers/index';
import OpenTasksFromPastPopup from '../../modals/openTasksFromPastPopup'
import TaskTransitionGroup from './taskTransitionGroup';
import './styles.scss';
import Task from './task';
const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		uncheckTask
	}, dispatch);
};

const makeMapStateToProps = () => {
	const getTasksForDay = makeGetTasksForDay()
	const mapStateToProps = (state, props) => {
		const today = Date.create().shortISO()
		let x = {
			tasks: getTasksForDay(state.data.tasks, props.day, props.selectedBranch, today, getUsersOnVacation(state)),
			users: state.data.users
		}
		return x;
	}
	return mapStateToProps
}

@connect(makeMapStateToProps(), mapDispatchToProps)
export default class Day extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showDoneTasks: false,
			openTasksFromPastPopupIsOpen: false
		};
	}

	shouldComponentUpdate = (nextProps, nextState) => shallowCompare(this, nextProps, nextState);

	componentWillReceiveProps = (nextProps) => {
		if (this.props.user && !nextProps.user || !this.props.user && nextProps.user) {
			window.shouldDisableTasksAnimation = true
		}
	}

	componentDidUpdate = (c) => {
		window.shouldDisableTasksAnimation = false
	}

	checkUncheck = (task, editFuturePossible) => {
		if (this.props.isBusy) return;
		playTaskCheckSound();
		let promise = task.isDone
			? this.props.uncheckTask(task.ID, task.dateString)
			: checkTaskStatic(task.ID, task.dateString, this.props.user.ID);
		promise.then(() => {
			toastr.success(`Aufgabe \"${task.subject}\" als ${task.isDone ? "Unerledigt" : "Erledigt"} eingetragen`);
		}).catch((e) => {
			toastr.error("Ein Fehler ist aufgetreten: " + e)
		})
	}

	render() {
		const {tasks, user, onPagingHandler} = this.props;
		if (!tasks) return null;
		this.today = Date.create()
		let dateObject = Date.create(this.props.day)
		let dateString = dateObject.shortISO()
		let isToday = dateObject.isSameDateAs(this.today)
		const isFuture = !isToday && dateObject.isAfter(Date.create())
		const isInPast = !isToday && !isFuture;
		const filteredTasks = tasks.filter(t => !user || !!_.values(t.assignedUsers).filter(auID => auID == user.ID).length)
		const checkedTasksCount = filteredTasks.filter(t => t.isDone || t.isIgnored).length
		const visibleTasks = _.sortBy(filteredTasks.filter(t => this.state.showDoneTasks || (!t.isDone && !t.isIgnored)), [
			t => !!t.isDone || !!t.isIgnored || !!t.isShifted,
			t => !(t.prio == 2),
			t => Date.parse(t.creationDate) * -1,
			"subject",
		])
		let dirtyItarator = 0; // if tasks are being preponed, there can be more than one task with the same key ( cause task.id is used as key)
		return (
			<fb className={cN({tasksDay: true, isToday: isToday, fullWidthDay: this.props.isFullWidthDay, inUserMode: user})}>
				<fb ref="tasksWrapper" className={`tasksWrapper`}>
					<TaskTransitionGroup>
						{ visibleTasks.length ?  visibleTasks.map(t => {
								return (
									<Task
										data={t}
										key={t.ID + (t.isPreponed ? dirtyItarator++ : "")}
										withCheckbox={user}
										dateString={dateString}
										onCheckboxClick={() => this.checkUncheck(t)}
										users={this.props.users}
										clickHandler={() => this.props.openCheckUncheckTaskPopup(t, isFuture)}/>)
							})
						: <fb className="noTasksBlock">Yuhu, keine Aufgaben mehr für { isToday ? "Heute" : "den Tag"}!</fb>}
					</TaskTransitionGroup>
					{checkedTasksCount
						? <fb
								className="task controlbutton"
								onClick={() => this.setState({
								showDoneTasks: (!this.state.showDoneTasks)
							})}>
								<fb className="head">
									<icon
										className={cN({
										icon: true,
										"icon-expand_less": this.state.showDoneTasks,
										"icon-expand_more": !this.state.showDoneTasks,
										"no-border": true
									})}/> {this.state.showDoneTasks
										? "Erledigte Aufgaben ausblenden"
										: "Erledigte Aufgaben anzeigen"}
									{!this.state.showDoneTasks
										? <fb className="doneTasksIndicator">{checkedTasksCount}</fb>
										: null}
								</fb>
							</fb>
						: null}
				</fb>
			</fb>
		);
	}
}
