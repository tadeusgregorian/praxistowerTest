import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Navbar from 'components/navbar';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dialog from 'material-ui/Dialog';
import SelectBranchDialog from 'components/selectBranchDialog';
import {registerUsersDataListener, registerGroupsDataListener, registerQmLettersDataListener, registerBranchesDataListener} from 'actions/index';
import {GT_dialogStyles} from 'helpers/index';
import cN from 'classnames';
import shallowCompare from 'react-addons-shallow-compare';
import Topbar from './topbar';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {filterTasksForUser} from 'helpers/index';
import {makeGetTasksForDay, getForgottenTasksFromPast, makeGetTasksNotificationsForUser} from 'selectors/tasksDaySelector';
import {getUsersOnVacation} from 'selectors/usersOnVacationSelector';

class Apps extends Component {
	baseTheme: any;

	constructor() {
		super();
		this.baseTheme = getMuiTheme({
			...baseTheme,
			palette: {
				...baseTheme.palette,
				primary1Color: "#656464",
				primary2Color: "#424242"
			}
		})

		this.state = {
			muiTheme: this.baseTheme,
			selectBranchDialogIsOpen: false,
			busy: false
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		return shallowCompare(this, nextProps, nextState);
	}

	static childContextTypes = {
		addBusy: React.PropTypes.func,
		removeBusy: React.PropTypes.func
	}

	getChildContext() {
		return {
			addBusy: (callback) => {
				this.setState({
					busy: true
				}, callback)
			},
			removeBusy: () => {
				this.setState({busy: false})
			}
		}
	}

	componentWillReceiveProps(nextProps, nextState) {
		let user = nextProps.users.find(u => u.ID == nextProps.params.id);
		if (user) {
			this.setCustomMuiTheme(user);
		} else {
			this.setState({muiTheme: this.baseTheme})
		}
		if (!nextProps.selectedBranch && nextProps.branches && nextProps.branches.length && !nextState.selectBranchDialogIsOpen) {
			this.setState({selectBranchDialogIsOpen: true})
		}
	}

	setCustomMuiTheme(user) {
		let muiTheme = getMuiTheme({
			...baseTheme,
			palette: {
				...baseTheme.palette,
				primary1Color: user && user.color || baseTheme.palette.primary1Color,
				primary2Color: user && user.color || baseTheme.palette.primary1Color
			}
		})
		this.setState({muiTheme});
	}

	componentWillMount() {
		if (!this.props.usersListenerSet)
			this.props.registerUsersDataListener();
		if (!this.props.groupsListenerSet)
			this.props.registerGroupsDataListener();
		if (!this.props.qmLettersListenerSet)
			this.props.registerQmLettersDataListener();
		if (!this.props.branchesListenerSet)
			this.props.registerBranchesDataListener();
	}

	render() {
		const user = this.props.params.id && this.props.users && this.props.users.find(u => u.ID == this.props.params.id)
		return (
			<MuiThemeProvider muiTheme={this.state.muiTheme}>
				<fb id="root" className={cN({'canBusy': true, 'busy': this.state.busy})}>
					<fb className="vertical">
						<Topbar  user={user} params={this.props.params} location={this.props.location} openSelectbranchDialog={() => this.setState({selectBranchDialogIsOpen: true})}/>
						<fb>
							<fb id="app">
								{React.cloneElement(this.props.children, {user})}
							</fb>
						</fb>
					</fb>
					<Dialog contentStyle={GT_dialogStyles} open={this.state.selectBranchDialogIsOpen} modal={true}>
						<SelectBranchDialog close={() => this.setState({selectBranchDialogIsOpen: false})}/>
					</Dialog>
				</fb>
			</MuiThemeProvider>
		);
	}
}


const mapStateToProps = (state) => {
	return {
		users: state.data.users,
		usersListenerSet: state.data.listenersSet.usersListenerSet,
		groupsListenerSet: state.data.listenersSet.usersListenerSet,
		qmLettersListenerSet: state.data.listenersSet.qmLettersListenerSet,
		branchesListenerSet: state.data.listenersSet.branchesListenerSet,
		selectedBranch: state.core.selectedBranch,
		branches: state.data.branches,
		busy: state.core.busy
	}
}


const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		registerUsersDataListener,
		registerGroupsDataListener,
		registerQmLettersDataListener,
		registerBranchesDataListener
	}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Apps);
