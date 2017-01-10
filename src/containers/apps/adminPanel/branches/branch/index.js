import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetch } from 'redux';
import { Link } from 'react-router';
import { removeUserFromBranch } from 'actions/index';
import SelectMemberPopup from 'components/selectMemberPopup';
import ConfirmPopup from 'components/confirmPopup';
import { openPopup } from 'actions/index';
import { deleteBranch } from 'actions/index';
import Dialog from 'material-ui/Dialog';
import _ from 'lodash';
import toastr from 'toastr';
import '../../styles.scss';


class EditBranchesContent extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			addMemberPopupOpen: false,
			deleteBranchPopupOpen: false
		}

		this.addMemberPopup = null;
		this.deleteBranchPopup = null;
	}

	removeUserButtonClicked(user) {
		if ( user.adminHash &&  _.keys(user.branches).length == 1 ){
			toastr.error("Der Admin-User muss mindestens einer Filliale zugehören.");
			return;
		}
		this.props.removeUserFromBranch(this.props.branch.ID, user.ID, this.userRemovedFromBranch);
	}

	userRemovedFromBranch() {

	}

	openAddMemberPopup() {
		this.setState({addMemberPopupOpen: true});
		this.addMemberPopup = <SelectMemberPopup case='branch' branchID={this.props.branch.ID} close={this.closeAddMemberPopup.bind(this)} />
	}

	closeAddMemberPopup(){
		this.setState({addMemberPopupOpen: false})
	}

	openDeleteBranchPopup() {
		this.deleteBranchPopup = (<ConfirmPopup
			headerText={"Filliale löschen"}
			mainText={<span>Soll die Filliale <b>{this.props.branch.name}</b> wirklich gelöscht werden?</span>}
			onDecisionMade={this.deleteBranch.bind(this)}
			close={this.closeDeleteBranchPopup.bind(this)}
		/>);
		this.setState({deleteBranchPopupOpen: true});
	}

	deleteBranch(confirm) {
		if(!confirm)return;
		this.props.deleteBranch(this.props.branch.ID, this.branchWasDeleted.bind(this));
	}

	closeDeleteBranchPopup() {
		this.setState({deleteBranchPopupOpen:false})
	}

	branchWasDeleted() {
		this.props.setSelectedBranch();
	}


	renderMemberElements() {
		//if( this.props.users[0] ) this.props.users[0].branches.find((groudID))
		if (!this.props.branch) { return null; }
		let members = this.props.users.filter(user => user.branches && user.branches[this.props.branch.ID]);
		let result = members && members.map(user =>
				<div className="group-member-element" key={user.ID}>
					<div className="group-member-name">{user.name}</div>
					<button onClick={() => this.removeUserButtonClicked(user)} className="button icon-minus slim no-margin">Aus Filiale entfernen</button>
				</div>
		);
		return result;
	}

	render() {
		const branch = this.props.branch;
		return (
			<div className="edit-groups-content">
                <div className="header">
                    <div className="group-name">
                        {branch ? branch.name : null}
                    </div>
                    <button className="button icon-bin" onClick={this.openDeleteBranchPopup.bind(this)} >Filliale löschen</button>
                </div>
				<div className="group-member-list" >
					{this.renderMemberElements()}
				</div>
				<button className="button icon-plus add-to-group-btn" onClick={this.openAddMemberPopup.bind(this)}>Nutzer hinzufügen</button>
				<Dialog className="materialDialog" open={this.state.addMemberPopupOpen} onRequestClose={this.closeAddMemberPopup.bind(this)}>
					{this.addMemberPopup}
				</Dialog>
				<Dialog className="materialDialog" open={this.state.deleteBranchPopupOpen} onRequestClose={this.closeDeleteBranchPopup.bind(this)}>
					{this.deleteBranchPopup}
				</Dialog>
            </div>
		);
	}
}


const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		openPopup,
		removeUserFromBranch,
		deleteBranch
	}, dispatch);
};

const mapStateToProps = (state) => {
	return {
		users: state.data.users,
		branches: state.data.branches
	};
};


export default connect(mapStateToProps, mapDispatchToProps)(EditBranchesContent);
