import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {fetch} from 'redux';
import composeWizard from 'composers/wizard';
import QmLetter from './letter';
import DefineContentStep from './modals/defineContentStep'
import AssignUsersStep from './modals/assignUsersStep'
import { openWizard, readQm, unreadQm, createQm, editQm, removeBusy} from 'actions/index';
import _ from 'lodash';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import DatePicker from 'material-ui/DatePicker';
import toastr from 'toastr';
import ReadUnreadQmPopup from './modals/readUnreadQmPopup/index.js';
import DeleteQmPopup from './modals/deleteQmPopup';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import ContentAdd from 'material-ui/svg-icons/content/add';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import {GT_dialogStyles} from 'helpers/index';
import shallowCompare from 'react-addons-shallow-compare';
import miniUser from 'components/miniUser';
import Perf from 'react-addons-perf';
import cN from 'classnames';
import LazyLoad from 'react-lazyload';
import Checkbox from 'material-ui/Checkbox';
import {forceCheck} from 'react-lazyload';
import './styles.scss'

class QmLetters extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			readUnreadQmDialogOpen: false,
			addEditQmWizardOpen: false,
			deleteQmPopupOpen: false,
			showOnlyUnreadQms: false,
			filter: ""
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		return shallowCompare(this, nextProps, nextState);
	}

	componentDidUpdate = () => {
			forceCheck();
	}

	// -------- Read and Unread QM
	closeReadUnreadQmModal = () => {
		this.setState({readUnreadQmDialogOpen: false});
	};

	openReadUnreadQmModal = (userID, unread, qmData) => {
		console.log(qmData)
		this.readUnreadQmPopup = (<ReadUnreadQmPopup user={this.props.user} unread={unread} qmData={qmData} close={this.closeReadUnreadQmModal} openAddEditQmWizard={this.openAddEditQmWizard} openDeleteQmPopup={this.openDeleteQmPopup} />);
		this.setState({readUnreadQmDialogOpen: true});
	};

	// -------- Add and edit qm letter (When adding new qm, param must be true)
	openAddEditQmWizard = (isAdding, qmData) => {
		const onFinish = isAdding
			? this.addQm
			: this.editQm
		this.setState({addEditQmWizardOpen: true});
		let Wizard = composeWizard([DefineContentStep, AssignUsersStep]);
		this.addEditQmWizard = (<Wizard user={this.props.user} creatorID={this.props.user.ID} initData={qmData} close={this.closeAddEditQmWizard} onFinish={onFinish.bind(this)}/>)
	}

	closeAddEditQmWizard = () => {
		this.setState({addEditQmWizardOpen: false})
	}

	openDeleteQmPopup = (qmID) => {
		this.setState({deleteQmPopupOpen: true});
		this.deleteQmPopup = (<DeleteQmPopup qmID={qmID} close={this.closeDeleteQmPopup}/>)
	}

	closeDeleteQmPopup = () => {
		this.setState({deleteQmPopupOpen: false});
	};

	addQm = (qmData) => {
		return this.props.createQm(qmData);
	}

	editQm = (qmData) => {
		return this.props.editQm(qmData);
	}

	getAssignedUsers = (qm) => {
		let assignedUsers = _.values(qm.assignedUsers).map(userID => this.props.users.find(user => user.ID == userID));
		assignedUsers = assignedUsers.filter(u => !!u);
		let assignedUsersExt = assignedUsers.map(assignedUser => {
			let clonedAssignedUser = {
				...assignedUser
			}
			let userHasRed = !!_.values(qm.usersRed).find(urID => urID == clonedAssignedUser.ID);
			clonedAssignedUser['hasRed'] = userHasRed;
			return clonedAssignedUser;
		});
		let assignedUsersSorted = assignedUsersExt.sortBy(u => String(u.hasRed));
		return (assignedUsersSorted.map(assignedUser => {
			return (miniUser(assignedUser));
		}));
	}

	renderQmLetters = () => {

		console.log('BROTHERRR')

		const {user} = this.props
		const id = user && user.ID
		if (!this.props.qmLetters) return [];
		let regexp = new RegExp(this.state.filter, "i")

		let mappedQmLettersData = this.props.qmLetters.filter(qm => this.props.user.adminHash || qm.creatorID == id || !!_.values(qm.assignedUsers).filter(auID => auID == id).length)
		if(this.state.filter) mappedQmLettersData = mappedQmLettersData.filter(qm => JSON.stringify(_.values(qm)).includes(regexp))
		mappedQmLettersData =  mappedQmLettersData.sortBy((qm) => Date.parse(qm.date), true).map(data => {

			let currentUserIsCreator = (user.ID == data.creatorID)
			let currentUserHasRed = !!_.values(data.usersRed).find(u => user.ID == u);
			return { ...data, hasRed: currentUserHasRed || currentUserIsCreator }
		});

		return mappedQmLettersData.map((data, i) => {
			if ( data.hasRed && this.state.showOnlyUnreadQms ) return false;
			const needsBorderBottom = data.hasRed && mappedQmLettersData.length != (i + 1) && mappedQmLettersData[i + 1].hasRed

			return(
				<LazyLoad placeholder={( <fb style={{ flexBasis: "41px" }} className="no-grow no-shrink"></fb> )}
									key={data.ID}
									height={41}
									overflow={true}
									once={true}
									debounce={80}
									offset={30}
				>
					<QmLetter
						openReadUnreadQmModal={this.openReadUnreadQmModal}
						openAddEditQmWizard={this.openAddEditQmWizard}
						openDeleteQmPopup={this.openDeleteQmPopup}
						currentUser={user}
						data={data}
						needsBorderBottom={needsBorderBottom}
						users={this.props.users}
						getAssignedUsers={this.getAssignedUsers}/>
				</LazyLoad>
		);
	})
}

	componentDidMount() {
		this.context.removeBusy()
	}

	static contextTypes = {
		removeBusy: React.PropTypes.func
	}

	onSearchFieldChanged = (e) => {
		this.setState({filter: e.target.value})
		forceCheck();
	}

	render = () => {
		window.counter = Date.create()
		return (
			<main className="qmLettersMainWrapper">
				<header className="horizontal left">
					<fb>
						<icon className="icon-search no-border"></icon>
						<TextField floatingLabelText="Suche" floatingLabelStyle={{color:'grey'}} value={this.state.filter} onChange={this.onSearchFieldChanged}/>
					</fb>
					<fb className="filterUnreadCheckbox">
						<Checkbox
							label="Nur ungelesene anzeigen"
							style={{fontSize: "14px"}}
							checked={this.state.showOnlyUnreadQms}
							onCheck={()=>{ this.setState({showOnlyUnreadQms: !this.state.showOnlyUnreadQms})}}
						/>
					</fb>
				</header>
				<fb className="qmLetters" style={{'overflowY': 'auto', 'overflowX': 'hidden'}}>
					{this.renderQmLetters()}
					{this.state.filter
						? <b className="padding textCenter">Nachrichten werden gerade mit "{this.state.filter}" gefiltert.</b>
					: null}
				</fb>
				<fb className="bottomButtonBar">
					<FloatingActionButton onClick={() => this.openAddEditQmWizard(true)}>
						<ContentAdd/>
					</FloatingActionButton>
				</fb>
				<Dialog className="materialDialog" contentStyle={GT_dialogStyles} open={this.state.readUnreadQmDialogOpen} onRequestClose={this.closeReadUnreadQmModal}>
					{this.readUnreadQmPopup}
				</Dialog>
				<Dialog className="materialDialog" contentStyle={GT_dialogStyles} open={this.state.addEditQmWizardOpen} onRequestClose={this.closeAddEditQmWizard}>
					{this.addEditQmWizard}
				</Dialog>
				<Dialog className="materialDialog" contentStyle={GT_dialogStyles} open={this.state.deleteQmPopupOpen} onRequestClose={this.closeDeleteQmPopup}>
					{this.deleteQmPopup}
				</Dialog>
			</main>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		openWizard,
		readQm,
		unreadQm,
		createQm,
		editQm,
		removeBusy
	}, dispatch);
};

const mapStateToProps = (state) => {
	return {qmLetters: state.data.qmLetters, users: state.data.users};
};

export default connect(mapStateToProps, mapDispatchToProps)(QmLetters);
