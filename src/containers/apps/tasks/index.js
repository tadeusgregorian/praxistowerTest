import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {registerTasksDataListener, updateTask} from 'actions/index';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import TransitionGroup from 'react-addons-css-transition-group'
import containerComposer from 'composers/container';
import Navbar from 'components/navbar';
import SelectUserBar from 'components/selectUserBar';
import _ from 'lodash';

@containerComposer()
class TasksApp extends React.Component {

	constructor() {
		super();
	}
	componentWillMount() {

		if (!this.props.tasksListenerSet) {
			this.props.busy(true)
			this.props.registerTasksDataListener().then(() => this.props.busy(false));
		}

		// setTimeout(() => {
		// 	this.updateTasksDateFormatBulk()
		// }, 8000);
	}

	updateTasksDateFormatBulk() {

		this.props.tasks.forEach((t) => {
			let newTask = {
				...t
			}
			if (newTask.endDate) {
				newTask.endDate = Date.create(newTask.endDate).shortISO()
			}
			if (newTask.startDate) {
				newTask.startDate = Date.create(newTask.startDate).shortISO()
			}

			if (newTask.onetimerDate) {
				newTask.onetimerDate = Date.create(newTask.onetimerDate).shortISO()
			}

			if (newTask.checked) {
				let newCheckedObject = {}
				_.forOwn(newTask.checked, (value, key) => {
					let newValue = {
						...value
					};
					let oldDate = key + "";
					if (Date.create(oldDate) == "Invalid Date") {
						oldDate = oldDate.substr(0, 2) + "." + oldDate.substr(2, 2) + "." + oldDate.substr(4, 4)

						let newDate = Date.create(oldDate).shortISO();
						newValue["date"] = Date.create(newDate).iso();
						newCheckedObject[newDate] = newValue;

					}
				});
				newTask.checked = newCheckedObject;
			}

			if (newTask.ignored) {
				let newIgnoredObject = {}
				_.forOwn(newTask.ignored, (value, key) => {
					let newValue = {
						...value
					};
					let oldDate = key + "";
					if (Date.create(oldDate) == "Invalid Date") {
						oldDate = oldDate.substr(0, 2) + "." + oldDate.substr(2, 2) + "." + oldDate.substr(4, 4)

						let newDate = Date.create(oldDate).shortISO();
						newValue["date"] = Date.create(newDate).iso();
						newIgnoredObject[newDate] = newValue;

					}
				});
				newTask.ignored = newIgnoredObject;
			}

			this.props.updateTask(newTask);
		});
	}

	render() {
		const {user} = this.props
		return (
			<main className="vertical">
				{ user ?
					<Navbar
						user={user}
						location={this.props.location}
						routes={[{name: "Kalender", path: `Apps/Tasks/${user.ID}`}, {name: "Editor", path: `Apps/Tasks/${user.ID}/Edit`}]}
						/> : <SelectUserBar selectedBranch={this.props.selectedBranch}/>
					}
				{React.cloneElement(this.props.children, {user})}
			</main>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		registerTasksDataListener,
		updateTask
	}, dispatch);
};

const mapStateToProps = (state) => {
	return {tasksListenerSet: state.data.listenersSet.tasksListenerSet,
		users: state.data.users,
		tasks: state.data.tasks,
		selectedBranch: state.core.selectedBranch
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(TasksApp);
