import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {fetch} from 'redux';
import {Link} from 'react-router';
import EditBranchesContent from './branch';
import cN from 'classnames';
import {openPopup} from 'actions/index';
import {addNewBranch} from 'actions/index';
import CreateBranchPopup from './createBranchPopup';
import Dialog from 'material-ui/Dialog';
import '../styles.scss';

class EditBranches extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedBranchID: null,
			createBranchPopupOpen: false
		};

		this.createBranchPopup = null;
	}

	branchElementClicked(e) {
		this.setState({selectedBranchID: e.target.id});
	}

	closeAddMemberPopup() {
		this.setState({createBranchPopupOpen: false});
	}

	openCreateBranchPopup() {
		this.setState({createBranchPopupOpen: true});
		this.createBranchPopup = (<CreateBranchPopup close={this.closeCreateBranchPopup.bind(this)}/>);
	}

	closeCreateBranchPopup() {
		this.setState({createBranchPopupOpen: false});
	}

	branchWasCreated() {}

	setSelectedBranch() {
		let firstBranchID = this.props.branches[0]
			? this.props.branches[0].ID
			: null;
		this.setState({selectedBranchID: firstBranchID});
	}

	render() {
		let selectedBranchID = this.state.selectedBranchID || this.props.branches[0] && this.props.branches[0].ID;
		return (
			<div className="edit-groups">
				<div className="groups-list">
					<div className="group-list-element list-head">Filialen</div>
					{this.props.branches.map((branch) => <div key={branch.ID} id={branch.ID} className={cN({
						'groups-list-element': true,
						'selected': (branch.ID == selectedBranchID)
					})} onClick={this.branchElementClicked.bind(this)}>{branch.name}
					</div>)}
					<div className="new-group-element">
						<button className="button icon-folder-plus" onClick={this.openCreateBranchPopup.bind(this)}>Filiale Erstellen</button>
					</div>
				</div>
				{< EditBranchesContent setSelectedBranch = {
					this.setSelectedBranch.bind(this)
				}
				branch = {
					this.props.branches.find(g => g.ID == selectedBranchID)
				} />}
				<Dialog className="materialDialog" open={this.state.createBranchPopupOpen} onRequestClose={this.closeAddMemberPopup.bind(this)}>
					{this.createBranchPopup}
				</Dialog>
			</div>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		openPopup,
		addNewBranch
	}, dispatch);
};

const mapStateToProps = (state) => {
	return {users: state.data.users, branches: state.data.branches};
};

export default connect(mapStateToProps, mapDispatchToProps)(EditBranches);
