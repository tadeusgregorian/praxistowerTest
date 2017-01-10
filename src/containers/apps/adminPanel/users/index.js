import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {fetch} from 'redux';
import {Link} from 'react-router';
import EditUserElement from './user';
import CreateUserElement from './newUser';
import {addNewUser} from 'actions/index';
import {deleteUser} from 'actions/index';
import {changeVacationStatusOfUser} from 'actions/index';
import Dialog from 'material-ui/Dialog';
import AddEditUserPopup from './addEditUserPopup';
import ConfirmPopup from 'components/confirmPopup';
import toastr from 'toastr';
import './styles.scss';

class EditUsers extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			addEditUserPopup_open: false,
			deleteUserPopup_open: false
		};
	}

	deleteUser(user){
		if( user.adminHash){
			toastr.error("der Admin-User darf nicht gelöscht werden.");
			return;
		}
		this.openDeleteUserPopup(user);
	}

	editUser(user){
		this.setState({addEditUserPopup_open: true});
		this.addEditUserPopup = (<AddEditUserPopup user={user} editingMode={true} close={this.closeAddEditUserPopup.bind(this)}/>) ;
	}

	openAddEditUserPopup(){
			this.setState({addEditUserPopup_open: true});
			this.addEditUserPopup = (<AddEditUserPopup close={this.closeAddEditUserPopup.bind(this)}/>) ;
	}

	closeAddEditUserPopup(){
		this.setState({addEditUserPopup_open: false});
	}

	openDeleteUserPopup(user) {
		this.deleteUserPopup =
		(<ConfirmPopup
			headerText={"Benutzer löschen"}
			mainText={<span>Soll der Benutzer <b>{user.name}</b> wirklich gelöscht werden?</span>}
			onDecisionMade={this.deleteUserFromDB.bind(this)}
			whatToConfirm={user}
			close={this.closeDeleteUserPopup.bind(this)}
		/>)
	this.setState({deleteUserPopup_open: true});
	}

	deleteUserFromDB(confirm, user) {
		if(!confirm)return;
		if(!user)return;
		this.props.deleteUser(user.ID, this.userWasDeleted.bind(this));
	}

	closeDeleteUserPopup() {
		this.setState({deleteUserPopup_open:false})
	}

	userWasDeleted() {

	}

	changeVacationStatusOfUser = (userID, isOnVacation) => {
		this.props.changeVacationStatusOfUser(userID, isOnVacation, this.vacationStatusChanged)
	}

	vacationStatusChanged = (userIsInVacationNow) => {

	}

	render() {
		return (
			<div className="edit-users-content">
				<fb className="newUserButtonWrapper">
					<button className="icon-plus button newUserButton" onClick={this.openAddEditUserPopup.bind(this)}>
						neuen nutzer anlegen
					</button>
				</fb>
				{this.props.users.map(user => (
					<EditUserElement
					user={user}
					key={user.ID}
					changeVacationStatusOfUser={this.changeVacationStatusOfUser}
					deleteUser={this.deleteUser.bind(this)}
					editUser={this.editUser.bind(this)}
					/>))
				}
				<Dialog className="materialDialog" open={this.state.addEditUserPopup_open} onRequestClose={this.closeAddEditUserPopup.bind(this)}>
					{this.addEditUserPopup}
				</Dialog>
				<Dialog className="materialDialog" open={this.state.deleteUserPopup_open} onRequestClose={this.closeDeleteUserPopup.bind(this)}>
					{this.deleteUserPopup}
				</Dialog>
			</div>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		changeVacationStatusOfUser,
		addNewUser,
		deleteUser
	}, dispatch);
};

const mapStateToProps = (state) => {
	return {users: state.data.users};
};

export default connect(mapStateToProps, mapDispatchToProps)(EditUsers);
