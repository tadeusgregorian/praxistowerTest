import React, { Component } from 'react';
import cN from 'classnames';
import { getTypeAndPatternOfTask } from 'helpers/index';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { checkTask, uncheckTask, ignoreTask, unignoreTask, addTaskComment, shiftTaskOnce } from 'actions/index';
import composePopup from 'composers/popup';
import toastr from 'toastr'
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';
import { Howl } from 'howler'
import DatePicker from 'material-ui/DatePicker';
import 'styles/modals.scss';
import './styles.scss';

class CheckUncheckTaskPopup extends Component {

	constructor(props) {
		super(props);
		// using a state here so the dialog rerenders
		this.state = {
			isIgnored: props.data.isIgnored,
			editFuturePossible: false,
			checkFutureEditPopupIsOpen: false,
			newCommentText: "",
			newlyAddedComments: [],
			user: props.user,
			chooseUserPopupIsOpen: false,
		}

	}

	checkUncheck = (editFuturePossible) => {
		window.counterBefore = Date.create();
		if (this.props.isBusy) return;
		this.tryingToIgnore = false
		if (!this.state.user) {
			this.setState({chooseUserPopupIsOpen: true});
			return;
		}
		if (this.state.chooseUserPopupIsOpen) {
			this.setState({chooseUserPopupIsOpen: false})
		}
		if (this.props.isInFuture && !editFuturePossible) {
			this.editFutureCallback = this.checkUncheck
			this.setState({checkFutureEditPopupIsOpen: true})
			return;
		}
		var sound = new Howl({
			src: ['sounds/checkSound1.mp3'],
			sprite: {
			  check: [100, 99999]
			},
			volume: 0.3,
		}).play("check");
		// this.props.busy(true);
		this.props.close();
		let promise = this.props.data.isDone ?
			this.props.uncheckTask(this.props.data.ID, this.props.data.dateString) :
			this.props.checkTask(this.props.data.ID, this.props.data.dateString, this.state.user.ID );
		promise.then(() => {
			// this.props.close();
			toastr.success(`Aufgabe \"${ this.props.data.subject }\" als ${ this.props.data.isDone ? "Unerledigt" : "Erledigt"} eingetragen`);
		}).catch((e) => {
			// this.props.close();
			toastr.error("Ein Fehler ist aufgetreten: " + e)
		})
	}

	ignoreUnignore = (editFuturePossible) => {
		if (this.props.isBusy) return;
		this.tryingToIgnore = true
		if (!this.state.user) {
			this.setState({chooseUserPopupIsOpen: true});
			return;
		}
		if (this.state.chooseUserPopupIsOpen) {
			this.setState({chooseUserPopupIsOpen: false})
		}
		if (this.props.isInFuture && !editFuturePossible) {
			this.editFutureCallback = this.ignoreUnignore
			this.setState({checkFutureEditPopupIsOpen: true})
			return;
		}

		var sound = new Howl({
			src: ['sounds/checkSound1.mp3'],
			sprite: {
			  check: [100, 99999]
			},
			volume: 0.3,
		}).play("check");

		this.props.close();
		let promise = this.state.isIgnored ?
			this.props.unignoreTask(this.props.data.ID, this.props.data.dateString) :
			this.props.ignoreTask(this.props.data.ID, this.props.data.dateString, this.state.user.ID);
		promise.then(() => {
			this.setState({isIgnored: !this.state.isIgnored});

			toastr.warning(`Aufgabe \"${ this.props.data.subject }\" ${ !this.state.isIgnored ? "nicht mehr ignoriert" : "ignoriert"}`);
		}).catch((e) => {

			toastr.error("Ein Fehler ist aufgetreten beim ignorieren des Tasks: " + e)
		})
	}

	shiftTask = (newDate) => {
		this.props.close();
		this.props.close();
		this.props.shiftTaskOnce(this.props.tasks.find(t => t.ID == this.props.data.ID), this.props.data.dateString, newDate).then(() => {
			toastr.success("Die Aufgabe wurde erfolgreich verschoben");
		}).catch((e) => {
			toastr.error("Ein Fehler ist aufgetreten beim verschieben der Aufgabe: " + e);
		});
	}

	addNewComment = () => {
		if (!this.state.newCommentText) return;
		this.props.busy(true);
		this.props.addTaskComment(this.props.data.ID, this.props.user.ID, this.state.newCommentText).then(() => {
			toastr.success(`Kommentar erfolgreich hinzugefügt`);
			let newlyAddedComments = [...this.state.newlyAddedComments, {
				text: this.state.newCommentText,
				creatorID: this.props.user.ID,
				dateString: Date.create().shortISO(),
				date: Date.create().iso()
			}]
			this.setState({showAddComment: false, newCommentText: "", newlyAddedComments})
		}).catch((e) => {
			toastr.error("Ein Fehler ist aufgetreten beim hinzufügen eines Kommentares: " + e)
		}).then(() => this.props.busy(false))
	}

	onCommentFieldKeyDown = (key) => {
		if (key.keyCode === 13){ this.addNewComment() }
	}

	isShiftedToNotification = () => {
		return(<fb className="specialNotification isDeadline">
			<icon className="icon-forward no-border"></icon>
			Verschoben auf den &nbsp;
			<b>{Date.create(this.props.data.shifted[this.props.data.dateString]).format('{dd}. {Month}')}</b>
		</fb>)
	}

	wasShiftedFromNofitication = () => {
		return (<fb className="specialNotification isDeadline" >
			<icon className="icon-forward no-border"></icon>
			Ursprünglich verschoben vom &nbsp;
			<b>{Date.create(this.props.data.originalShiftedTask.date).format('{dd}. {Month}')}</b>
		</fb>)
	}

	isDeadlineNotification = () => {
		return (<fb className="specialNotification isDeadline" >
			<icon className="icon-bell no-border"></icon>
			Deadline dieser Aufgabe ist der &nbsp;
			<b> { Date.create(this.props.data.onetimerDate).format('{dd}. {Month}') }</b>
		</fb>)
	}

	tryingToIgnore = false

	render() {

		const t = this.props.data
		const taskTypeAndPattern = getTypeAndPatternOfTask(this.props.data);
		const ignoreButton = (
			<RaisedButton
				label={this.props.data.isIgnored ? 'Ignorierung aufheben' : 'Ignorieren'}
				onClick={() => this.ignoreUnignore(this.state.editFuturePossible)}
				disabled={!this.state.isIgnored && !!this.props.data.isDone || !!this.props.data.isShifted}
				primary={!!this.props.data.isIgnored}
			/>
		)
		const checkUncheckButton = 	(
			<RaisedButton
				primary={true}
				label={!!this.props.data.isDone ? 'Nicht erledigt' : 'Erledigt'}
				onClick={() => this.checkUncheck(this.state.editFuturePossible)}
				disabled={!!this.state.isIgnored || !!this.props.data.isShifted}
			/>
		)
		const notLoggedInText = <fb className='popupMessage'>Um die Aufgaben als erledigt zu markieren müssen Sie erst einen Nutzer wählen.</fb>
		let comments = this.props.data.comments
			? [...this.state.newlyAddedComments, ..._.values(this.props.data.comments).filter(c => c.dateString == this.props.data.dateString)]
			: this.state.newlyAddedComments
		const isShifted = t.shifted && t.shifted[t.dateString]
		return (
			<fb>
				<header>
					<h4 className="no-margin">{this.props.data.subject}</h4>
					<p>Erstellt von <b>{this.props.creator} </b>am<b> {Date.create(this.props.data.creationDate).format('{dd}.{MM}.{yyyy}')}</b></p>
					{ isShifted ? this.isShiftedToNotification() : null}
					{ t.originalShiftedTask ? this.wasShiftedFromNofitication () : null}
					{ t.isDeadline ? this.isDeadlineNotification() : null}
					<p><b>{taskTypeAndPattern.type} </b> {( taskTypeAndPattern.patternFullLength || taskTypeAndPattern.pattern)}</p>
					{ this.props.data.isDone && this.props.data.isDoneDate ?
						<p>Erledigt am <b>{Date.create(this.props.data.isDoneDate).format('{dd}.{MM}.{yyyy} - {24hr}:{mm}')}</b> von <b>{this.props.users.find(u => u.ID == this.props.data.isDoneBy).name}</b>
						</p>
					: null }
					{ this.props.data.isIgnored && this.props.data.isIgnoredDate ?
						<p>Ignoriert am <b>{Date.create(this.props.data.isIgnoredDate).format('{dd}.{MM}.{yyyy} - {24hr}:{mm}')}</b> von <b>{this.props.users.find(u => u.ID == this.props.data.isIgnoredBy).name}</b>
						</p>
					: null }
				</header>
				<content>
					<fb className="no-shrink margin-bottom">{this.props.data.text}</fb>
					{comments.length ? <fb className="comments vertical margin-top">
						<fb className="title">Kommentare</fb>
						{ comments.sortBy(c => Date.parse(c.date), true).map(c => {
							let user = this.props.users.find(u => u.ID == c.creatorID)
							let userName = user ? user.name : "Unbekannt"
							return (
							<fb className="comment" key={c.date}>
								<fb className="text">{c.text}</fb>
								<fb className="vertical no-grow no-shrink padding-left rightBox">
									<fb className="commentUser">
										{userName}
									</fb>
									<fb className="date no-grow">{Date.create(c.date).format('{dd}.{MM}.{yyyy} - {24hr}:{mm}')}</fb>
								</fb>
							</fb>
						)})}
					</fb> : null}
					{this.props.user && this.state.showAddComment ?
						<fb className="no-shrink" style={{position: "relative", marginBottom: "2px"}}>
							<TextField
							  className="commentBox"
						      floatingLabelText="Neuer Kommentar"
							  value={this.state.newCommentText}
							  onChange={(e) => this.setState({newCommentText: e.target.value})}
							  onKeyDown={this.onCommentFieldKeyDown}
							  fullWidth={true}
							  autoFocus
						    />
						{ this.state.newCommentText ?
							(
								<FlatButton
							      onClick={this.addNewComment}
							      icon={<FontIcon className="icon icon-check_circle" />}
							      style={{position: "absolute", right: 0, top: "18px", minWidth: "40px"}}
								  primary={true}
							    />
							)
							: null
						}
						</fb>
					: null}
				</content>
				{
					<footer>
					{ignoreButton}
					<fb className="margin-left">
						<FlatButton
						  onClick={() => this.refs.jumpToDatePicker.openDialog()}
						  label="Verschieben"
						  primary={true}
						  disabled={!!this.props.data.isIgnored || !!this.props.data.isChecked  || !!this.props.data.isShifted}
						/>
					</fb>
					<fb className="right no-grow">
						{  this.props.user && !this.state.showAddComment ?
						<fb className="no-grow padding-right">
							<FlatButton
								style={{minWidth: "36px"}}
								primary={true}
								icon={<FontIcon className="icon icon-comment no-border"/>}
								onClick={() => this.setState({showAddComment: true})}/>
						</fb>
						: null}
						{checkUncheckButton}
					</fb>
					</footer>
				}


				<Dialog
					style={{zIndex: 9999999}}
					actions={[
						<FlatButton
							label="Nein"
							primary={true}
							onClick={() => this.setState({checkFutureEditPopupIsOpen: false})}
						/>,
						<FlatButton
							label="Ja"
							primary={true}
							onClick={() => {
								this.setState({editFuturePossible: true, checkFutureEditPopupIsOpen: false});
								this.editFutureCallback(true);
							}}
						/>
					]}
					modal={true}
					open={this.state.checkFutureEditPopupIsOpen}
				>
					Sind Sie sich sicher, dass Sie eine Aufgabe bearbeiten wollen, die sich in der Zukunft befindet?
				</Dialog>
				<Dialog open={this.state.chooseUserPopupIsOpen} style={{zIndex: 9999999}} onRequestClose={() => this.setState({chooseUserPopupIsOpen: false})}>
					<fb className="vertical">
					<fb>Bitte wählen Sie ihren Nutzer aus:</fb>
					<fb className="horizontal wrap offset">
					{this.props.users.filter(u => u.branches && u.branches[this.props.selectedBranch.ID]).map(user => (
						<div key={user.ID} onClick={() => {
								this.setState({user}, () => {
									this.tryingToIgnore ? this.ignoreUnignore(this.state.editFuturePossible) : this.checkUncheck(this.state.editFuturePossible)
								})
							}}
							className="user " style={{backgroundColor: user.color}}>
							{user.nameInitials}
						</div>
					))}
					</fb>
					</fb>
				</Dialog>
				<DatePicker
					style={{"display": "none", "zIndex": 9999999}}
					ref='jumpToDatePicker'
					onChange={(e, d) => {if (!(typeof d === 'string' || d instanceof String)) this.shiftTask(d)}}
					floatingLabelText="asd"
					cancelLabel="Abbrechen"
					okLabel="Verschieben"
					autoOk={false}
					DateTimeFormat={DateTimeFormat}
					locale="de-DE"
				/>
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


export default composePopup(connect(mapStateToProps, mapDispatchToProps)(CheckUncheckTaskPopup));
