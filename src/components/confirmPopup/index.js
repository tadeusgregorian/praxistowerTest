import cN  from 'classnames'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import composePopup  from 'composers/popup';
import 'styles/popup.scss';

class ConfirmPopup extends Component {
	onFinish() {
		this.props.close(this);
	}

	onConfirmButtonClicked() {
		this.props.onDecisionMade(true, this.props.whatToConfirm);
		this.onFinish();
	}

	onDenyButtonClicked() {
		this.props.onDecisionMade(false);
		this.onFinish();
	}

	render() {
		return (
			<div className="confirm-popup">
				<header>
					<h3>{this.props.headerText}</h3>
				</header>
				<content>
					<fb className="popup-content">
						{this.props.mainText}
					</fb>
				</content>
				<footer>
					<button onClick={this.onDenyButtonClicked.bind(this)}>
						Abbrechen
					</button>
					<right>
						<button onClick={this.onConfirmButtonClicked.bind(this)}>
							Bestätigen
						</button>
					</right>
				</footer>
			</div>
		);
	}
}

export default composePopup(ConfirmPopup);
