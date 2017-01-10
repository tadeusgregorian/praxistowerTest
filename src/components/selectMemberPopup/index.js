import cN  from 'classnames'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addUserToGroup } from 'actions/index'
import { addUserToBranch } from 'actions/index'
import composePopup from 'composers/popup';
import 'styles/popup.scss';

class SelectMemberPopup extends Component {
	constructor(props) {
		super(props);
	}

	onFinish() {
		this.props.close(this);
	}

	onUserClicked(userID) {
		const clickedUser = (this.props.users.find(user => user.ID == userID));
		if(this.props.case == 'group'){
			const groupID = this.props.groupID;
			const assignedGroups = clickedUser.assignedGroups;
			const assignedGroupsNew = Object.assign({[groupID]: groupID}, assignedGroups);
			this.props.addUserToGroup(userID, assignedGroupsNew, this.userWasAdded);
		}
		if(this.props.case == 'branch'){
			const branchID = this.props.branchID;
			const branches = clickedUser.branches;
			const branchesNew = Object.assign({[branchID]: branchID}, branches);
			this.props.addUserToBranch(userID, branchesNew, this.userWasAdded);
		}
	}

	userWasAdded() {

	}

	renderUsers() {
		let nonMembers = {};
		if (this.props.case == 'group'){
			nonMembers = this.props.users.filter(user => !user.assignedGroups || !user.assignedGroups[this.props.groupID]);
		}
		if(this.props.case == 'branch'){
			nonMembers = this.props.users.filter(user => !user.branches || !user.branches[this.props.branchID]);
		}
		const res = nonMembers.map(user =>
			<button key={user.ID} onClick={ (() => this.onUserClicked(user.ID)) } className="button icon-plus username-button">{user.name}</button>
		);
		return res;
	}

	render() {
		return (
			<div className="select-member-popup">
				<header>Neues Mitglied wählen</header>
				<fb className="popup-content">
					{this.renderUsers()}
				</fb>
				<footer>
					<button
						className="right"
						onClick={(this.onFinish).bind(this)}>
						Fertig
					</button>
				</footer>
			</div>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		addUserToGroup,
		addUserToBranch
	}, dispatch);
};
const mapStateToProps = (state) => {
	return {
		users: state.data.users,
		groups: state.data.groups,
		branches: state.data.branches
	};
};


export default composePopup(connect(mapStateToProps, mapDispatchToProps)(SelectMemberPopup));
