import cN  from 'classnames'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addNewGroup } from 'actions/index'
import composePopup  from 'composers/popup';
import '../../styles.scss';
import 'styles/popup.scss';

class CreateGroupPopup extends Component {
	constructor(props) {
		super(props);

		this.state = {
			groupName: ''
		};
	}

	onFinish() {
		this.props.close(this);
	}

	onButtonClicked() {
		this.props.addNewGroup(this.state.groupName, this.groupWasAdded.bind(this));
	}

	groupWasAdded() {

		this.onFinish();
	}

	onInputChanged(input) {
		this.setState({groupName: input.target.value});
	}

	render() {
		return (
			<div className="create-group-popup">
				<header>
					<h3>Gruppenname eingeben</h3>
				</header>
				<fb className="popup-content">
					<input type="text" placeholder="Gruppenname" onChange={this.onInputChanged.bind(this)} autoFocus/>
				</fb>
				<footer>
					<button className={cN({
						'right': true,
						'disabled': (!this.state.groupName)
					})} onClick={(this.onButtonClicked).bind(this)}>
						Gruppe erstellen
					</button>
				</footer>
			</div>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		addNewGroup
	}, dispatch);
};
const mapStateToProps = (state) => {
	return {users: state.data.users, groups: state.data.groups};
};

export default composePopup(connect(mapStateToProps, mapDispatchToProps)(CreateGroupPopup));
