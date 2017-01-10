import React, { Component } from 'react';
import cN from 'classnames';
import { getTypeAndPatternOfTask } from 'helpers/index';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { checkTask, uncheckTask, ignoreTask, unignoreTask, addTaskComment, shiftTaskOnce } from 'actions/index';
import {GT_dialogStyles} from 'helpers/index';
import composePopup from 'composers/popup';
import toastr from 'toastr'
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';
import { Howl } from 'howler'
import DatePicker from 'material-ui/DatePicker';
import AssignedUsers from 'components/assignedUsers';
import ChooseReplacementPopup from '../chooseReplacementPopup'
import 'styles/modals.scss';
import './styles.scss';




class TaskDetailsPopup extends Component {
	constructor(props) {
		super(props);
		this.state = {
			chooseReplacementPopupIsOpen: false
		}
	}

	editTask = () => {
		this.props.close();
		this.props.editTask(this.props.task);
	}

	deleteTask = () => {
		this.props.close();
		this.props.deleteTask(this.props.task);
	}

	openChooseReplacementPopup = () => {
		const sofarReplacedByUserID = this.props.task.replacements && this.props.task.replacements[this.props.user.ID]

		this.chooseReplacementPopup = (
			<ChooseReplacementPopup
				replacedUserID={this.props.user.ID}
				taskID={this.props.task.ID}
				replacedByUserID={sofarReplacedByUserID}
				users={this.props.users.filter(u => u.branches && u.branches[this.props.selectedBranch.ID] && u.ID != this.props.user.ID)}
				replacementSelected={this.replacementSelectd}
				replacedByUserID={sofarReplacedByUserID}
				close={this.closeChooseReplacementPopup}
			/>)
		this.setState({chooseReplacementPopupIsOpen: true})
	}

	replacementSelectd = () => {
		this.props.close();
	}

	closeChooseReplacementPopup = () => {
		this.setState({chooseReplacementPopupIsOpen: false})
	}

	renderReplacementBox = () => {
		const u = this.props.user;
		const replacedByUserID = this.props.task.replacements && this.props.task.replacements[u.ID]
		const replacerName = replacedByUserID && this.props.users.find( u => u.ID == replacedByUserID).name

		return (
			<fb className="selectedUserRow">
				<fb className="textfb"> Meine Vertretung: </fb>
				<fb className="replacementButtonWrapper">
					<fb className ={cN({ 'selected-user-name': true, 'noOneSelected': !replacerName })}>
						{replacerName ? replacerName : 'keine Vertretung'}
					</fb>
					{ !this.props.doneOrEnded ? <icon className="icon-pencil" onClick={ this.openChooseReplacementPopup }></icon> : null }
				</fb>
			</fb>
		)
	}

	isShiftedToNotification = () => {
		return(<fb className="specialNotification isDeadline">
			<icon className="icon-forward no-border"></icon>
			Verschoben auf den &nbsp;
			<b>{Date.create(this.props.task.shifted[this.props.task.dateString]).format('{dd}. {Month}')}</b>
		</fb>)
	}

	wasShiftedFromNofitication = () => {
		return (<fb className="specialNotification isDeadline" >
			<icon className="icon-forward no-border"></icon>
			Ursprünglich verschoben vom &nbsp;
			<b>{Date.create(this.props.task.originalShiftedTask.date).format('{dd}. {Month}')}</b>
		</fb>)
	}

	isDeadlineNotification = () => {
		return (<fb className="specialNotification isDeadline" >
			<icon className="icon-bell no-border"></icon>
			Deadline dieser Aufgabe ist der &nbsp;
			<b> { Date.create(this.props.task.onetimerDate).format('{dd}. {Month}') }</b>
		</fb>)
	}

	render() {

		const t = this.props.task
		const taskTypeAndPattern = getTypeAndPatternOfTask(t);
		const isShifted = t.shifted && t.shifted[t.dateString]

		return (
			<fb className="taskDetailsPopup">
				<header>
					<h4 className="no-margin">{t.subject}</h4>
					{ t.prio > 0 ? <p><b style={{color:'red'}}>Aufgabe mit hoher Priorität</b></p> : null }
					<p>Erstellt von <b>{this.props.users.find( u => u.ID == t.creatorID ).name }
					</b> am <b> {Date.create(t.creationDate).format('{dd}.{MM}.{yyyy}')}</b></p>
					{ isShifted ? this.isShiftedToNotification() : null}
					{ t.originalShiftedTask ? this.wasShiftedFromNofitication () : null}
					{ t.isDeadline ? this.isDeadlineNotification() : null}
					<p><b>{taskTypeAndPattern.type} </b> {( taskTypeAndPattern.patternFullLength || taskTypeAndPattern.pattern)}</p>
					<fb className="assignedUsersWrapper">
						<AssignedUsers assignedUsers={t.assignedUsers} maxDisplayedMiniUsers={40} />
					</fb>
					{ t.isDone && t.isDoneDate ?
						<p>Erledigt am
							<b>{Date.create(t.isDoneDate).format('{dd}.{MM}.{yyyy} - {24hr}:{mm}')}
							</b> von <b>{this.props.users.find(u => u.ID == t.isDoneBy).name}</b>
						</p>
					: null }
					{ t.isIgnored && t.isIgnoredDate ?
						<p>Ignoriert am <b>{Date.create(t.isIgnoredDate).format('{dd}.{MM}.{yyyy} - {24hr}:{mm}')}</b> von <b>{this.props.users.find(u => u.ID == t.isIgnoredBy).name}</b>
						</p>
					: null }
				</header>
				<content>
					<fb className="no-shrink margin-bottom">{t.text}</fb>
					{ t.assignedUsers[this.props.user.ID] ? this.renderReplacementBox() : null }
				</content>
				{
					<footer>
						<RaisedButton
							className=""
						  onClick={this.editTask}
						  label="Bearbeiten"
						  primary={true}
						  disabled={!!this.props.doneOrEnded}
						/>
						<RaisedButton
							className="margin-left"
							onClick={this.deleteTask}
							label={t.onetimerDate || t.irregularDates ? "Löschen" : "Löschen"}
							primary={true}
							disabled={!!this.props.doneOrEnded}
						/>
					</footer>
				}
				<Dialog className="materialDialog" contentStyle={GT_dialogStyles} open={this.state.chooseReplacementPopupIsOpen} onRequestClose={this.closeChooseReplacementPopup}>
					{this.chooseReplacementPopup}
				</Dialog>
			</fb>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		checkTask,
		uncheckTask,
		ignoreTask,
		unignoreTask,
		addTaskComment,
		shiftTaskOnce
	}, dispatch);
};

const mapStateToProps = state => ({users: state.data.users, selectedBranch: state.core.selectedBranch, tasks: state.data.tasks})


export default composePopup(connect(mapStateToProps, mapDispatchToProps)(TaskDetailsPopup));
