import React, { Component } from 'react';
import cN from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { editTaskReplacemnt, deleteTaskReplacement } from 'actions/index';
import composePopup from 'composers/popup';
import toastr from 'toastr'
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Divider from 'material-ui/Divider';
import Dialog from 'material-ui/Dialog';
import 'styles/modals.scss';
import 'styles/popup.scss';

class ChooseReplacementPopup extends Component {

	constructor(props) {
		super(props);
		this.state = {
			selectedUserID: this.props.replacedByUserID
		}

		console.log(this.props.replacedByUserID)
	}

	selectClickedUser = (userID) => {
		if(userID == this.state.selectedUserID){
			this.setState({selectedUserID:'wasDeselected'})
		}else {
			this.setState({selectedUserID:userID})
		}

		console.log(userID)
	}

	saveReplacment = () => {
		if (this.props.addEditTaskWizzardIsCalling) {
			console.log("addEditTaskWizzardIsCalling")
			this.props.replacementWasChosen(this.props.replacedUserID,this.state.selectedUserID)
		} else {
			if(this.state.selectedUserID == "wasDeselected"){
				this.props.deleteTaskReplacement(this.props.taskID, this.props.replacedUserID).then(this.replacementSaved);
				console.log("someoneElse is calling")
			}else {
				this.props.editTaskReplacemnt(this.props.taskID, this.props.replacedUserID, this.state.selectedUserID).then(this.replacementSaved);
				console.log("someone else too")
			}
		}
		this.props.close();
	}

	replacementSaved = (error) => {
		if (this.state.selectedUserID === 'wasDeselected'){
			toastr.success('Die Vertretung wurde entfernt');
		} else {
				toastr.success(  this.props.users.find(u => u.ID == this.state.selectedUserID).name +' als Vertretung gespeichert.');
		}
		if ( this.props.replacementSelected ) this.props.replacementSelected();
	}

	renderPossibleReplacementUsers = () => {
		return this.props.users.map( u => {
			return (<fb key={u.ID}
						onClick={() => this.selectClickedUser(u.ID)}
						className={cN({
							'selectableUser':true,
							'selected': (u.ID == this.state.selectedUserID)
						})}
					>{u.name}</fb>)
		})
	}

	render() {
		return (
			<fb className="replacementPopup">
				<header>
					<h4>Vertretung wählen</h4>
				</header>
				<content>
					<p>Wähle deine Vertretung für diese Aufgabe</p>
					<fb className="selectableUserWrapper">
						{this.renderPossibleReplacementUsers()}
					</fb>
				</content>
				<footer>
					<fb className="left">
						<button onClick={this.props.close}>Abbrechen</button>
					</fb>
					<div className="content-right">
						<button onClick={this.saveReplacment}>Bestätigen</button>
					</div>
				</footer>
			</fb>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		editTaskReplacemnt,
		deleteTaskReplacement
	}, dispatch);
};


export default composePopup(connect(null, mapDispatchToProps)(ChooseReplacementPopup));
