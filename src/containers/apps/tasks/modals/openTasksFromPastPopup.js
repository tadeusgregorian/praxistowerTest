import React, {Component} from 'react';
import cN from 'classnames';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {checkTask, uncheckTask, ignoreTask, unignoreTask, addTaskComment} from 'actions/index';
import composePopup from 'composers/popup';
import toastr from 'toastr'
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import AssignedUsers from 'components/assignedUsers';
import {Howl} from 'howler'
import Dialog from 'material-ui/Dialog';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {playTaskCheckSound} from 'helpers/index';
import 'styles/modals.scss';
import RoundCheckbox from 'components/roundCheckbox';
class OpenTasksFromPastPopup extends Component {

	constructor(props) {
		super(props);
		// using a state here so the dialog rerenders
		this.state = {
			tasks: [],
			chooseUserPopupIsOpen: false
		}
		console.log(props.user)
	}

	formatHourAndMinute(hour, minute) {
		let hourString = hour.toString();
		hourString = hourString.length == 1
			? '0' + hourString
			: hourString;
		let minuteString = minute.toString();
		minuteString = minuteString.length == 1
			? '0' + minuteString
			: minuteString;
		return hourString + ':' + minuteString;
	}

	componentWillMount() {
		this.setState({tasks: this.props.getOpenTasksFromPast()})
	}

	componentWillReceiveProps(nextProps, nextState) {
		let tasks = this.props.getOpenTasksFromPast()
		if (!tasks.length) {
			this.props.close()
		}
		this.setState({tasks})
	}

	checkTask = (task) => {
		if (this.props.isBusy)
			return;
		let promise = this.props.checkTask(task.ID, task.dateString, this.props.user.ID);
		playTaskCheckSound();
		promise.then(() => {
			toastr.success(`Aufgabe \"${task.subject}\" für den ${Date.create(task.dateString).format("{dd}.{MM}.{yyyy}")} als ${task.isDone
				? "Unerledigt"
				: "Erledigt"} eingetragen`);
		}).catch((e) => {
			toastr.error("Ein Fehler ist aufgetreten: " + e)
		})
	}
	render() {
		let {tasks} = this.state
		return (
			<fb>
				<header>
					<h4>Unerledigte Aufgaben in der Vergangenheit</h4>
				</header>
				<content>
					<ReactCSSTransitionGroup
						transitionEnter={true}
						transitionLeave={true}
						transitionName="taskAnimation"
						transitionEnterTimeout={200}
						transitionLeaveTimeout={200}>
						{tasks.map(t => {
							let prioString = `prio-${t.prio}`
							return (
								<fb className="taskItemWrapper" key={t.ID + t.dateString}>
									{this.props.user
										? <RoundCheckbox checked={t.isDone || t.isIgnored} clickHandler={() => this.checkTask(t)} />
										: null}
									<fb
										className={cN({task: true, [prioString]: true, isDone: t.isDone, isIgnored: t.isIgnored, insideOpenTasksFromPastModal: true})}>
										<fb className="body" onClick={() => this.props.openCheckUncheckTaskPopup(t)}>
											<fb className="head">
												<fb className="date margin-right no-grow">{Date.create(t.dateString).format("{dd}. {Mon}").toUpperCase()}</fb>
												<fb className="subject">{t.subject}</fb>
												{t.hour
													? <fb className="time">
															<icon className="icon-alarm alarm-icon"></icon>{this.formatHourAndMinute(t.hour, t.minute)}</fb>
													: null}
											</fb>
											{t.isPreponed
												? <fb className="tag">Vorgezogen</fb>
												: null}
											{t.isDeadline
												? <fb
														className={cN({
														tag: true,
														deadline: t.onetimerDate == dateString
													})}>Deadline{t.onetimerDate != dateString
															? " " + Date.create(t.onetimerDate).format('{dd}. {Mon}').toUpperCase()
															: null}</fb>
												: null}
											{(t.isIgnored || t.isShifted)
												? <fb className="tag">{t.isIgnored
															? "ignoriert"
															: (t.isShifted
																? "verschoben"
																: null)}</fb>
												: <AssignedUsers
													assignedUsers={t.assignedUsers}
													users={this.props.users}
													isDone={t.isDone}
													isDoneBy={t.isDoneBy}
													colorStyle={'colorful'}
													maxDisplayedMiniUsers={7}
													showReplacements={true}/>}
										</fb>
									</fb>
								</fb>
							);
						})}
					</ReactCSSTransitionGroup>
				</content>
				<footer>
					<div className="content-right">
						<FlatButton primary={true} label={"Schließen"} onClick={this.props.close}/>
					</div>
				</footer>
			</fb>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		ignoreTask,
		checkTask
	}, dispatch);
};

const mapStateToProps = state => {
	return {users: state.data.users, allTasks: state.data.tasks, selectedBranch: state.core.selectedBranch}
}

export default composePopup(connect(mapStateToProps, mapDispatchToProps)(OpenTasksFromPastPopup));
