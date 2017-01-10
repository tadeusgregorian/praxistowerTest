import cN  from 'classnames'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addNewBranch } from 'actions/index'
import composePopup  from 'composers/popup';
import '../../styles.scss';
import 'styles/popup.scss';

class CreateBranchPopup extends Component {
	constructor(props) {
		super(props);

		this.state = {
			branchName: ''
		};
	}

	onFinish() {
		this.props.close(this);
	}

	onButtonClicked() {
		this.props.addNewBranch(this.state.branchName, this.branchWasAdded.bind(this));
	}

	branchWasAdded() {

		this.onFinish();
	}

	onInputChanged(input) {
		this.setState({branchName: input.target.value});
	}


	render() {
		return (
			<div className="create-group-popup">
				<header><h3>Name der Filiale eingeben</h3></header>
				<fb className="popup-content">
					<input type="text" placeholder="Gruppenname" onChange={this.onInputChanged.bind(this)} autoFocus/>
				</fb>
				<footer>
					<button
						className={cN({'right': true, 'disabled': (!this.state.branchName)})}
						onClick={(this.onButtonClicked).bind(this)}>
						Filliale erstellen
					</button>
				</footer>
			</div>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		addNewBranch
	}, dispatch);
};
const mapStateToProps = (state) => {
	return {
		users: state.data.users,
		branches: state.data.branches
	};
};


export default composePopup(connect(mapStateToProps, mapDispatchToProps)(CreateBranchPopup));
