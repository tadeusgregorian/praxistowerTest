import React, {Component, PropTypes} from 'react';
import cN from 'classnames';
import {filterUsersByGroup} from 'helpers/index';
import _ from 'lodash';
import {connect} from 'react-redux';
import toastr from 'toastr';
import RaisedButton from 'material-ui/RaisedButton';
import {TaskType} from './constants'
import {Howl} from 'howler'
import ChooseReplacementPopup from '../chooseReplacementPopup'
import Dialog from 'material-ui/Dialog';
import {GT_dialogStyles} from 'helpers/index';
import 'styles/modals.scss';

class AssignUsersStep extends Component {
	constructor(props) {
		super(props);
		this.state = {
			assignedUsers: props.subState.assignedUsers || props.initData && props.initData.assignedUsers || {},
			replacements: props.subState.replacements || props.initData && props.initData.replacements || {},
			selectedGroups: [],
			replacementPopupIsOpen: false,
			replacementBoxOpen: false
		};
	}

	static contextTypes = {
		muiTheme: PropTypes.object.isRequired
	};

	safeAndNextStep = () => {
		this.props.setSubState({
			...this.state
		});
		this.props.nextStep();
	}

	safeAndPreviousStep = () => {
		this.props.setSubState({
			assignedUsers: this.state.assignedUsers,
			replacements: this.state.replacements
		});
		this.props.previousStep();
	}

	onFinish = () => {

		if (this.props.isBusy)
			return;
		this.props.busy(true);

		const taskData = {
			creatorID: this.props.creatorID,
			branch: this.props.selectedBranch.ID,
			...this.props.initData,
			...this.props.subState,
			assignedUsers: this.state.assignedUsers,
			replacements: this.state.replacements
		}

		// Clean up the data, before uploading it
		if (!taskData.withDetailedTime) {
			delete taskData.hour;
			delete taskData.minute;
		}

		if (!taskData.withEndDate && taskData.endDate)
			delete taskData.endDate;

		delete taskData.withDetailedTime;
		delete taskData.selectedGroups;
		delete taskData.withStartDate;
		delete taskData.withEndDate;
		delete taskData.replacementPopupIsOpen;
		delete taskData.replacementBoxOpen;

		if (taskData.repeatEvery == 1) {
			delete taskData.repeatEvery
		}

		if (taskData.type != TaskType.daily) {
			delete taskData.includeSunday;
			delete taskData.includeSaturday;
		}

		if (taskData.type != TaskType.yearly) {
			delete taskData.yearly;
		}

		if (taskData.type != TaskType.irregular) {
			delete taskData.irregularDates;
		}

		if (taskData.type != TaskType.weekly) {
			delete taskData.weekly;
		} else {
			taskData.beginningOfWeekMs = Date.create(taskData.startDate).beginningOfWeek().getTime()
		}

		if (taskData.type != TaskType.monthly) {
			delete taskData.monthly;
		}

		if (taskData.type == TaskType.onetimer) {
			delete taskData.endDate;
		} else {
			delete taskData.onetimerDate;
		}

		if (!taskData.isDeadline) {
			delete taskData.alertDaysBeforeDeadline;
		} else {
			taskData.startDate = Date.create(taskData.onetimerDate).addDays(-taskData.alertDaysBeforeDeadline).iso()
		}

		if (taskData.deadline) {
			taskData.deadline = Date.create(taskData.deadline).shortISO()
		}

		if (taskData.onetimerDate) {
			taskData.onetimerDate = Date.create(taskData.onetimerDate).shortISO()
		}

		if (taskData.endDate) {
			taskData.endDate = Date.create(taskData.endDate).shortISO()
		}

		if (taskData.startDate) {
			taskData.startDate = Date.create(taskData.startDate).shortISO()
		}

		let sound = new Howl({
			src: ['sounds/checkSound5.mp3'],
			sprite: {
				check: [100, 99999]
			},
			volume: 0.3
		}).play("check");
		this.props.onFinish(taskData).then(() => {
			this.props.close();
			if (this.props.initData) {
				toastr.success(`Aufgabe \"${this.props.subState.subject}\" erfolgreich bearbeitet`);
			} else {
				toastr.success(`Aufgabe \"${this.props.subState.subject}\" erfolgreich erstellt`);
			}
		}).catch((e) => {
			this.props.close();
			toastr.error(`Fehler beim ${this.props.initData
				? "Bearbeiten"
				: "Erstellen"} der Aufgabe: ` + e);
		});
	}

	refreshReplacements = (assignedUsers) => {
		let clonedReplacements = _.clone(this.state.replacements);
		for (let key in clonedReplacements) {
			if (!assignedUsers[key]) {
				delete clonedReplacements[key]
			}
		}
		this.setState({replacements: clonedReplacements})
	}

	openChooseReplacementPopup = (taskID, replacedUserID, sofarReplacedByUserID) => {
		this.chooseReplacementPopup = (<ChooseReplacementPopup replacedUserID={replacedUserID} addEditTaskWizzardIsCalling={true} taskID={taskID} replacedByUserID={sofarReplacedByUserID} users={this.props.users.filter(u => u.branches[this.props.selectedBranch.ID] && u.ID != replacedUserID)} replacementWasChosen={this.replacementWasChosen} close={this.closeReplacementPopup}/>)
		this.setState({replacementPopupIsOpen: true})
	}

	replacementWasChosen = (replacedUserID, replacedByUserID) => {
		if (replacedByUserID == 'wasDeselected') {
			let replacements_cloned = { ...this.state.replacements }
			delete replacements_cloned[replacedUserID]
			this.setState({ replacements: replacements_cloned })
			return;
		}
		this.setState({replacements: { ...this.state.replacements, [replacedUserID]:replacedByUserID } })
	}

	closeReplacementPopup = () => {
		this.setState({replacementPopupIsOpen: false})
	}

	selectUsersByGroup(g) {
		let selectedGroups = _.clone(this.state.selectedGroups);
		let index = selectedGroups.indexOf(g.ID);
		if (index < 0) {
			selectedGroups.push(g.ID);
		} else {
			selectedGroups.removeAt(index);
		}

		this.setState({selectedGroups: selectedGroups})

		let selectedUsersIds = {};
		for (let i of selectedGroups) {
			let usersArray = filterUsersByGroup(this.getUsersOfSelectedBranch(), i);
			for (let f of usersArray) {
				selectedUsersIds[f.ID] = f.ID;
			}
		}
		this.setState({assignedUsers: selectedUsersIds});
		this.refreshReplacements(selectedUsersIds);
	}

	selectDeselectUser(u) {
		let clonedAssignedUsers = _.clone(this.state.assignedUsers);
		if (clonedAssignedUsers[u.ID]) {
			delete clonedAssignedUsers[u.ID];
			this.refreshReplacements(clonedAssignedUsers);
		} else {
			clonedAssignedUsers[u.ID] = u.ID;
		}
		this.setState({assignedUsers: clonedAssignedUsers})
	}

	getUsersOfSelectedBranch() {
		return this.props.users.filter( u => {
			 if (!u.branches){ return false }
			 return u.branches[(this.props.subState && this.props.subState.branch) || (this.props.initData && this.props.initData.branch) || this.props.selectedBranch.ID]
		 });
	}

	renderReplacementBox = () => {
		return (
			<fb className="selectedUserRowsWrapper">{this.getUsersOfSelectedBranch().filter(u => !!this.state.assignedUsers[u.ID]).map(u => {
					const isSelected = true;
					const replacedByUserID = this.state.replacements && this.state.replacements[u.ID]
					const replacerName = replacedByUserID && this.props.users.find(u => u.ID == replacedByUserID).name

					return (
						<fb className='selectedUserRow' key={"row_" + u.ID}>
							<fb key={u.ID} className='selected-user-name' style={{
								color: this.context.muiTheme.palette.primary1Color,
								borderColor: this.context.muiTheme.palette.primary1Color
							}}>
								{u.name}
							</fb>
							<fb className="textfb">
								Vertretung:
							</fb>
							<fb className="replacementButtonWrapper">
								<fb className ={cN({
									'selected-user-name': true,
									'noOneSelected': !replacerName
								})}>{replacerName
										? replacerName
										: 'keine Vertretung'}</fb>
								<icon className="icon-pencil" style={{
									color: this.context.muiTheme.palette.primary1Color
								}} onClick={() => this.openChooseReplacementPopup('isNewTask', u.ID, replacedByUserID)}></icon>
							</fb>
						</fb>
					);
				})}
			</fb>
		)
	}

	render() {
					console.log(this.state.replacements)
		return (
			<div>
				<header>
					<h3>Nutzer zuweisen</h3>
				</header>
				<content>
					<fb className="user-group-wrapper">
						{this.props.groups.map(g => {
							let isSelected = (this.state.selectedGroups.indexOf(g.ID) >= 0);
							return (
								<div key={g.ID} className={cN({"user-group": true, "selected": isSelected})} style={{
									backgroundColor: (isSelected
										? this.context.muiTheme.palette.primary1Color
										: "#BBBBBB")
								}} onClick={() => this.selectUsersByGroup(g)}>
									{g.name}
								</div>
							);
						})}
					</fb>

					<fb className="modal-user-wrapper padding-top">
						{this.getUsersOfSelectedBranch().map(u => {
							let isSelected = this.state.assignedUsers[u.ID]
							return (
								<fb key={u.ID} className={cN({'modal-user': true, 'selected': isSelected})} onClick={() => this.selectDeselectUser(u)} style={{
									color: (isSelected
										? this.context.muiTheme.palette.primary1Color
										: '#353535'),
									borderColor: (isSelected
										? this.context.muiTheme.palette.primary1Color
										: 'grey')
								}}>
									{u.name}
								</fb>
							);
						})}
					</fb>
					<fb className="modal-selected-user-wrapper">
						<button className="showReplacementsButton" onClick={() => this.setState({
							replacementBoxOpen: !this.state.replacementBoxOpen
						})}>
							{!this.state.replacementBoxOpen
								? <icon className="icon-expand_more no-border"></icon>
								: <icon className="icon-expand_less no-border"></icon>}
							{!this.state.replacementBoxOpen
								? 'Vertretungen anzeigen '
								: 'Vertretungen ausblenden '}
							{!_.isEmpty(this.state.assignedUsers)
								? `(${Object.keys(this.state.assignedUsers).length})`
								: null}
						</button>
						{this.state.replacementBoxOpen
							? this.renderReplacementBox()
							: null}
					</fb>
				</content>
				<footer>
					<RaisedButton className="left" label='Zurück' primary={true} onClick={this.safeAndPreviousStep}/>
					<RaisedButton className="right" label='Fertig' disabled={_.isEmpty(this.state.assignedUsers)} primary={true} onClick={this.onFinish}/>
				</footer>
				<Dialog className="materialDialog" contentStyle={GT_dialogStyles} open={this.state.replacementPopupIsOpen} onRequestClose={this.closeReplacementPopup}>
					{this.chooseReplacementPopup}
				</Dialog>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {users: state.data.users, groups: state.data.groups, selectedBranch: state.core.selectedBranch};
};

export default connect(mapStateToProps)(AssignUsersStep);
