import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {fetch} from 'redux';
import _ from 'lodash';
import {createTask, updateTask} from 'actions/index';
import composeWizard from 'composers/wizard';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Dialog from 'material-ui/Dialog';
import ContentAdd from 'material-ui/svg-icons/content/add';
import CheckUncheckTaskPopup from '../../modals/checkUncheckTaskPopup'
import cN from 'classnames'
import AssignUsersStep from '../../modals/addEditTaskWizardSteps/assignUsersStep'
import ChooseTypeStep from '../../modals/addEditTaskWizardSteps/chooseTypeStep'
import DefineContentStep from '../../modals/addEditTaskWizardSteps/defineContentStep'
import SetTimingStep from '../../modals/addEditTaskWizardSteps/setTimingStep'
import toastr from 'toastr';
import {GT_dialogStyles} from 'helpers/index';
import EditCreatedTask from './task';
import DeleteTaskPopup from '../../modals/deleteTaskPopup'
import {getUserById} from 'helpers/index';
import Toggle from 'material-ui/Toggle';
import LazyLoad from 'react-lazyload';
import {forceCheck} from 'react-lazyload';
import {Wochentage} from '../../modals/addEditTaskWizardSteps/constants'
import ChooseReplacementPopup from '../../modals/chooseReplacementPopup';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import {TaskType} from '../../modals/addEditTaskWizardSteps/constants';
import TaskDetailsPopup from '../../modals/taskDetailsPopup';
import './styles.scss';

class EditCreatedTasks extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			currentDay: Date.create(),
			addEditTaskWizardIsOpen: false,
			deleteTaskPopupIsOpen: false,
			taskDetailsPopupIsOpen: false,
			filterCreator: null,
			filterAssignedUser: this.props.user.ID, // have per default Tasks filtered by AssignedUser
			taskSearchString: '',
			showOnlyActiveTasks: false
		}
	}

	componentDidUpdate = () => {
			forceCheck();
	}

	openAddEditTaskWizard = (tasksData) => {
		this.setState({ addEditTaskWizardIsOpen: true })
		let wizardSteps = [SetTimingStep, DefineContentStep, AssignUsersStep]
		let Wizard = composeWizard(wizardSteps)
		this.addEditTaskWizard = (
			<Wizard creatorID={this.props.user.ID}
				initData={tasksData}
				close={this.closeAddEditTaskWizard}
				onFinish={this.editTask.bind(this)}
				selectedBranch={this.props.selectedBranch}/>
		)
	}

	openTaskDetailsPopup = (task, doneOrEnded) => {
		console.log(task)
		this.setState({ taskDetailsPopupIsOpen: true })
		this.taskDetailsPopup = (
			<TaskDetailsPopup task={task}
				user={this.props.user}
				selectedBranch={this.props.selectedBranch}
				doneOrEnded = {doneOrEnded}
				close={this.closeTaskDetailsPopup}
				editTask={this.openAddEditTaskWizard}
				deleteTask={this.openDeleteTaskPopup}
				/>
		)
	}

	openDeleteTaskPopup = (task) => {
		this.setState({ deleteTaskPopupIsOpen: true })
		this.deleteTaskPopup = (
			<DeleteTaskPopup task={task}
				close={this.closeDeleteTaskPopup}
				/>
		)
	}

	editTask = (editedTaskData) => {
		// We are cloning the task, editing it and creating a new one with a new startDate
		let today = Date.create()
		let endDateIsTodayOrInFuture = !editedTaskData.endDate || (Date.create(editedTaskData.endDate).isAfter(Date.create()) || Date.create(editedTaskData.endDate).isSameDateAs(today))
		let oldTaskData = this.props.tasks.find(t => t.ID == editedTaskData.ID);
		oldTaskData = {
			...oldTaskData,
			isDuplicate: true,
			endDate: endDateIsTodayOrInFuture ? Date.create().addDays(-1).shortISO() : editedTaskData.endDate
		}
		let newTaskData = {
			...editedTaskData,
			originalStartDate: editedTaskData.startDate,
			creationDate: editedTaskData.creationDate,
			startDate: Date.create().shortISO()
		}
		const editOldTaskPromise = this.props.updateTask(oldTaskData)
		const createNewTaskPromise = this.props.createTask(newTaskData)

		return Promise.all([editOldTaskPromise, createNewTaskPromise])
	}

	closeAddEditTaskWizard = () => {
		this.setState({addEditTaskWizardIsOpen: false});
	}

	closeTaskDetailsPopup = () => {
		this.setState({taskDetailsPopupIsOpen: false});
	}

	closeDeleteTaskPopup = () => {
		this.setState({deleteTaskPopupIsOpen: false});
	}

	filteredSortedTasks(){
		let user = this.props.user
		let userID = user.ID;



		let unfilteredTasks = this.props.tasks.filter(t => !t.isDuplicate);  // duplicates get created when terminating a repeting task.
		unfilteredTasks = unfilteredTasks.filter( t => !t.originalShiftedTask); // when shifting tasks onetimers are being created, we want to filter them out here.

		let filtTs = unfilteredTasks;
		if (this.state.filterCreator && this.state.filterCreator !== "none") filtTs = filtTs.filter( t => t.creatorID == this.state.filterCreator );
		if (this.state.filterAssignedUser && this.state.filterAssignedUser !== "none") filtTs = filtTs.filter( t => t.assignedUsers && t.assignedUsers[this.state.filterAssignedUser]);
		if (this.state.taskSearchString) filtTs = filtTs.filter(
				t => t.subject.toLowerCase().includes(this.state.taskSearchString.toLowerCase()) ||
				t.text.toLowerCase().includes(this.state.taskSearchString.toLowerCase()))





		let sortedFilteredTasks = filtTs.sortBy(((t) => Date.parse(t.creationDate)),true);

		return sortedFilteredTasks;
	}

	renderTasks = () => {
		const today = Date.create();
		return this.filteredSortedTasks().map(t => {

			const isOnetimerAndDone = t.type == 0 && t.checked;
			const isRepeatingAndHasEnded = !! (t.endDate && Date.create(t.endDate).isBefore(today) && !Date.create(t.endDate).isSameDateAs(today))
			const isMultidateAndAllDone = t.type == 6 && t.checked && _.keys(t.checked).length == t.irregularDates.length
			const doneOrEnded = !!(isOnetimerAndDone || isRepeatingAndHasEnded || isMultidateAndAllDone)
			if( this.state.showOnlyActiveTasks && doneOrEnded ) return false;

			return (
			<LazyLoad height={44} overflow={true} offset={30} once={true} debounce={80} key={t.ID} placeholder={(<fb style={{height:'44px', borderTop:'1px solid #d3d3d3', paddingTop:'14px', paddingLeft:'14px', color:'#d3d3d3'}}>loading...</fb>)} >
				<EditCreatedTask className={cN({isOpen: this.state.openedTaskID == t.ID })}
					today={today}
					users={this.props.users}
					user={this.props.user}
					task={t}
					isDone={isOnetimerAndDone || isMultidateAndAllDone}
					hasEnded={isRepeatingAndHasEnded}
					openTaskDetailsPopup={this.openTaskDetailsPopup} />
			</LazyLoad>)
			})
	}

	filterCreatorChanged = (event, index, value) => { this.setState({filterCreator: value})}
	filterAssignedUserChanged = (event, index, value) => { this.setState({filterAssignedUser: value})}
	searchFieldChanged = (event) => {
		this.setState({taskSearchString:  event.target.value})
	}
	showOnlyActiveChanged = () => {
		this.setState({ showOnlyActiveTasks: !this.state.showOnlyActiveTasks  })
	}
	//checkboxChanged = (event, isChecked) => { this.setState({ showDoneTasks: isChecked }) }

	renderSearchFilterBar(){

		let usersOfCurrentBranch = this.props.users.filter( u => u.branches && u.branches[this.props.selectedBranch.ID] );

		const creatorMenuItems = usersOfCurrentBranch.map( u => <MenuItem key={u.ID} value={u.ID} primaryText={u.name} /> );
		creatorMenuItems.unshift( <MenuItem key={"keinFilter"} value={"none"} primaryText={'Kein Filter'} /> )

		const assignedUserMenuItems = usersOfCurrentBranch.map( u => <MenuItem key={u.ID} value={u.ID} primaryText={u.name} /> )
		assignedUserMenuItems.unshift( <MenuItem key={"test"} value={"none"} primaryText={'Kein Filter'} /> )


		let selectedCreatorUser =  this.props.users.find( u => u.ID == this.state.filterCreator )
		let selectedAssignedUser =  this.props.users.find( u => u.ID == this.state.filterAssignedUser )
		return(
			<fb className="searchFilterBar">
				<fb className="creatorFilterWrapper selectFieldWrapper">
					<SelectField
	          value={this.state.filterCreator}
	          onChange={this.filterCreatorChanged}
	          floatingLabelText="Ersteller"
						underlineStyle={{ borderColor: "rgba(0,0,0,0.15)"}}
						iconStyle={{fill: "rgba(0,0,0,0.15)"}}
						floatingLabelStyle={{color: 'grey' }}
						style={{width: 160, fontSize:14, fontWeight: 'bold' }}
						labelStyle={{ color: !selectedCreatorUser ? '#b5b5b5' : selectedCreatorUser.color }}
	        >
	          {creatorMenuItems}
	        </SelectField>
				</fb>
				<fb className="searchFieldWrapper">
					<icon className="icon icon-search no-border"></icon>
					<TextField
						id="text-field-controlled"
						value={this.state.taskSearchString}
						onChange={this.searchFieldChanged}
						hintText={'Suche'}
						underlineStyle={{ borderColor: "rgba(0,0,0,0.15)"}}
						style={{width:160}}
					/>
				</fb>
				<fb className="assignedUserFilterWrapper selectFieldWrapper">
					<SelectField
						value={this.state.filterAssignedUser}
						onChange={this.filterAssignedUserChanged}
						floatingLabelText="Beauftragter"
						underlineStyle={{ borderColor: "rgba(0,0,0,0.15)"}}
						iconStyle={{fill: "rgba(0,0,0,0.15)"}}
						floatingLabelStyle={{color: 'grey' }}
						style={{width: 160, fontSize:14, fontWeight: 'bold'}}
						labelStyle={{ color: !selectedAssignedUser ? '#b5b5b5' : selectedAssignedUser.color }}
					>
						{assignedUserMenuItems}
					</SelectField>
				</fb>
				<fb className="filterActivesCheckbox">
				<Checkbox
					label="Nur aktive anzeigen"
					style={{fontSize: "14px"}}
					checked={this.state.showOnlyActiveTasks}
					onCheck={this.showOnlyActiveChanged}
				/>
				</fb>
			</fb>
		)
	}

	renderHeaderRow(){ return(
		<fb className="taskRow headerRow">
			<fb className="creator">Ersteller</fb>
			<fb className="taskInfo">Aufgabe</fb>
			<fb className="assignedUsers">Beauftragte</fb>
			<fb className="taskType">Typ</fb>
			<fb className="creationDate">erstellt am</fb>
		</fb>)
	}

	render() {
		const user = this.props.user
		const userColor = user && user.color;
		return (
			<content className={cN({"no-padding": true, "createdTasksContent": true})}>
				{this.renderSearchFilterBar()}
				<fb className="vertical taskListWrapper">
						{this.renderHeaderRow()}
					<fb className="edit-tasks-list">
						{this.renderTasks()}
					</fb>
				</fb>
				<Dialog className="materialDialog" contentStyle={GT_dialogStyles} open={this.state.addEditTaskWizardIsOpen} onRequestClose={this.closeAddEditTaskWizard}>
					{this.addEditTaskWizard}
				</Dialog>
				<Dialog className="materialDialog" contentStyle={GT_dialogStyles} open={this.state.taskDetailsPopupIsOpen} onRequestClose={this.closeTaskDetailsPopup}>
					{this.taskDetailsPopup}
				</Dialog>
				<Dialog className="materialDialog" contentStyle={GT_dialogStyles} open={this.state.deleteTaskPopupIsOpen} onRequestClose={this.closeDeleteTaskPopup}>
					{this.deleteTaskPopup}
				</Dialog>
			</content>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		createTask,
		updateTask
	}, dispatch);
};

const mapStateToProps = (state) => {
	return {tasks: state.data.tasks, users: state.data.users, selectedBranch: state.core.selectedBranch};
};

export default connect(mapStateToProps, mapDispatchToProps)(EditCreatedTasks);
