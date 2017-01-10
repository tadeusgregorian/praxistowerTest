import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetch } from 'redux';
import { Link } from 'react-router';
import SelectMemberPopup from 'components/selectMemberPopup';
import ConfirmPopup from 'components/confirmPopup';
import { deleteGroup, openPopup, removeUserFromGroup } from 'actions/index';
import Dialog from 'material-ui/Dialog';
import '../../styles.scss';

class EditGroupsContent extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			addMemberPopupOpen: false,
			deleteGroupPopupOpen: false
		}

		this.addMemberPopup = null;
		this.deleteGroupPopup = null;
	}

	removeUserButtonClicked(userID) {
		this.props.removeUserFromGroup(this.props.group.ID, userID, this.userRemovedFromGroup);


	}

	userRemovedFromGroup() {

	}

	openAddMemberPopup() {
		this.setState({addMemberPopupOpen: true});
		this.addMemberPopup = <SelectMemberPopup case='group' groupID={this.props.group.ID} close={this.closeAddMemberPopup.bind(this)} />
	}

	closeAddMemberPopup(){
		this.setState({addMemberPopupOpen: false})
	}

	openDeleteGroupPopup() {
		this.deleteGroupPopup = <ConfirmPopup
			headerText={"Gruppe löschen"}
			mainText={<span>Soll die Gruppe <b>{this.props.group.name}</b> wirklich gelöscht werden?</span>}
			onDecisionMade={this.deleteGroup.bind(this)}
			close={this.closeDeleteGroupPopup.bind(this)}
		/>;
		this.setState({deleteGroupPopupOpen: true});
	}

	deleteGroup(confirm) {
		if(!confirm)return;
		this.props.deleteGroup(this.props.group.ID, this.groupWasDeleted.bind(this));
	}

	closeDeleteGroupPopup() {
		this.setState({deleteGroupPopupOpen:false})
	}

	groupWasDeleted() {
		this.props.setSelectedGroup();
	}


	renderMemberElements() {
		//if( this.props.users[0] ) this.props.users[0].assignedGroups.find((groudID))
		if (!this.props.group) { return null; }
		let members = this.props.users.filter(user => user.assignedGroups && user.assignedGroups[this.props.group.ID]);
		let result = members && members.map(user =>
				<div className="group-member-element" key={user.ID}>
					<div className="group-member-name">{user.name}</div>
					<button onClick={() => this.removeUserButtonClicked(user.ID)} className="button icon-minus slim no-margin">Aus Gruppe entfernen</button>
				</div>
		);
		return result;
	}

	render() {
		const group = this.props.group;
		return (
			<div className="edit-groups-content">
                <div className="header">
                    <div className="group-name">
                        {group ? group.name : null}
                    </div>
                    <button className="button icon-bin" onClick={this.openDeleteGroupPopup.bind(this)} >Gruppe löschen</button>
                </div>
				<div className="group-member-list" >
					{this.renderMemberElements()}
				</div>
				<button className="button icon-plus add-to-group-btn" onClick={this.openAddMemberPopup.bind(this)}>Nutzer hinzufügen</button>
				<Dialog className="materialDialog" open={this.state.addMemberPopupOpen} onRequestClose={this.closeAddMemberPopup.bind(this)}>
					{this.addMemberPopup}
				</Dialog>
				<Dialog className="materialDialog" open={this.state.deleteGroupPopupOpen} onRequestClose={this.closeDeleteGroupPopup.bind(this)}>
					{this.deleteGroupPopup}
				</Dialog>
            </div>
		);
	}
}


const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		openPopup,
		removeUserFromGroup,
		deleteGroup
	}, dispatch);
};

const mapStateToProps = (state) => {
	return {
		users: state.data.users,
		groups: state.data.groups
	};
};


export default connect(mapStateToProps, mapDispatchToProps)(EditGroupsContent);
