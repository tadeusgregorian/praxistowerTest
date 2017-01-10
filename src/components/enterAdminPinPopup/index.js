import React, { Component } from 'react';
import cN from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import composePopup from 'composers/popup';
import toastr from 'toastr';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import sha1 from 'sha1';
import 'styles/popup.scss';

class EnterAdminPinPopup extends Component {

	constructor(props) {
		super(props);
		// using a state here so the dialog rerenders
		this.state = {
			pin: "",
		}
	}

	handlePinAddNumber = (n) => {
		if(this.state.pin.length == 3) {
			this.onAccess(this.state.pin + "" + n);
		} else {
			this.setState({pin : this.state.pin + "" + n })
		}
	}

	renderButtonForNumber = (i) => {
		return (
			<button
				style={{height: "40px"}}
				key={i}
				onClick={() => this.handlePinAddNumber(i)}>
				{i}
			</button>
		)
	}

	onAccess = (pin) => {
		const encryptedPin = sha1(pin)
		if (encryptedPin == this.props.user.adminHash) {
			sessionStorage["adminHash"] = encryptedPin
			this.props.close();
			this.props.onFinish();
			toastr.success("Willkommen " + this.props.user.name);
		} else {
			this.setState({pin: ""})
			toastr.error("Admin Pin falsch. Bitte erneut eingeben");
		}
	}

	render() {
		return (
			<fb>
				<header><h4>Pin eingeben für {this.props.user.name}</h4></header>
				<content className="j-center a-center enterPinPopup">
					<fb className="no-grow" style={{position: "relative"}}>
						<TextField
						  className="margin-bottom padding-bottom"
							floatingLabelText="Pin"
							type="password"
						  value={this.state.pin}
						/>
						<icon className="icon-close no-border" onClick={() => this.setState({pin: this.state.pin.slice(0, -1)})}></icon>
					</fb>

					<fb className="vertical a-center">
						<fb className="horizontal offset slim">{ _.range(1,4).map(i => this.renderButtonForNumber(i))}</fb>
						<fb className="horizontal offset slim">{ _.range(4,7).map(i => this.renderButtonForNumber(i))}</fb>
						<fb className="horizontal offset slim">{ _.range(7,10).map(i => this.renderButtonForNumber(i))}</fb>
						<fb className="horizontal offset slim j-center">{ ["0"].map(i => this.renderButtonForNumber(i))}</fb>
					</fb>
				</content>
				<footer className="right">
					<RaisedButton
						label={"Eintreten"}
						primary={true}
						onClick={this.onAccess} />
				</footer>
			</fb>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
	}, dispatch);
};


export default composePopup(connect(null, mapDispatchToProps)(EnterAdminPinPopup));
