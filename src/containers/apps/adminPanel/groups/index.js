import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetch } from 'redux';
import { Link } from 'react-router';
import EditGroupsContent from './group';
import cN from 'classnames';
import { openPopup, addNewGroup } from 'actions/index';
import CreateGroupPopup from './createGroupPopup';
import Dialog from 'material-ui/Dialog';
import '../styles.scss';


class EditGroups extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedGroupID: null,
			createGroupPopupOpen: false
		};

		this.createGroupPopup = null;
	}

	groupElementClicked(e) {
		this.setState({selectedGroupID: e.target.id});
	}

	closeAddMemberPopup(){
		this.setState({createGroupPopupOpen: false});
	}

	openCreateGroupPopup() {
			this.setState({createGroupPopupOpen: true});
			this.createGroupPopup = (<CreateGroupPopup close={this.closeCreateGroupPopup.bind(this)}/>) ;
	}

	closeCreateGroupPopup(){
		this.setState({createGroupPopupOpen: false});
	}

	groupWasCreated() {

	}

	setSelectedGroup() {
		let firstGroupID = this.props.groups[0] ? this.props.groups[0].ID : null;
		this.setState({selectedGroupID: firstGroupID});
	}


	render() {
		let selectedGroupID = this.state.selectedGroupID || this.props.groups[0] && this.props.groups[0].ID;
		return (
			<div className="edit-groups">
				<div className="groups-list">
					{ this.props.groups.map((group) =>
						<div
							key={group.ID}
							id={group.ID}
							className={cN({'groups-list-element': true, 'selected': (group.ID == selectedGroupID)})}
							onClick={this.groupElementClicked.bind(this)}>{group.name}
						</div>
					)}
					<div className="new-group-element">
						<button className="button icon-folder-plus" onClick={ this.openCreateGroupPopup.bind(this) } >Gruppe Erstellen</button>
					</div>
				</div>
				{ <EditGroupsContent setSelectedGroup={this.setSelectedGroup.bind(this)} group={this.props.groups.find(g => g.ID == selectedGroupID)} /> }
				<Dialog className="materialDialog" open={this.state.createGroupPopupOpen} onRequestClose={this.closeAddMemberPopup.bind(this)}>
					{this.createGroupPopup}
				</Dialog>
			</div>
		);
	}
}


const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		openPopup,
		addNewGroup
	}, dispatch);
};

const mapStateToProps = (state) => {
	return {
		users: state.data.users,
		groups: state.data.groups
	};
};


export default connect(mapStateToProps, mapDispatchToProps)(EditGroups);
