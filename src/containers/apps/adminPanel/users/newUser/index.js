import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetch } from 'redux';
import { openPopup } from 'actions/index';
import cN from 'classnames';
import { addNewUser} from 'actions/index';
import PickColorPopup from 'components/pickColorPopup';

class CreateUserElement extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			name: '',
			nameInitials: '',
			color: '',
			someInputMissing: false
		};

		this.outsidefbClasses = cN({
			'inline-input-wrapper': true,
			'no-shrink': true,
			'newUserRow': true
		});
	}

	nameChanged(e) {
		let input = e.target.value;
		this.setState({name: input});
	}

	initialsChanged(e) {
		let input = e.target.value;
		this.setState({nameInitials: input});
	}

	onButtonClicked() {
		let nameMissing = !this.state.name;
		let nameInitialsMissing = this.state.nameInitials.length < 4;
		let colorMissing = !this.state.color;

		this.props.displayNotifications({
			nameMissing: nameMissing,
			nameInitialsMissing: nameInitialsMissing,
			colorMissing: colorMissing
		});

		if (nameMissing||nameInitialsMissing||colorMissing) {
			this.setState({someInputMissing: true});
			return;
		}
		this.setState({someInputMissing: false});
		let createdUser = {
			name: this.state.name,
			nameInitials: this.state.nameInitials,
			color: this.state.color,
			isOnVacation: false
		};
		this.props.addNewUser(createdUser, this.userWasAdded.bind(this)); // Calling an Actioncreator here.
	}

	userWasAdded() {

		this.setState({
			name: '',
			nameInitials: '',
			color: ''
		});
	}

	openPickColorPopup = () => {
		this.props.openPickColorPopup((
			<PickColorPopup onColorPicked={this.colorWasPicked.bind(this)} close={this.props.closePickColorPopup}/>
		));
	}

	colorWasPicked(color) {
		this.setState({color: color});
	}

	render() {
		let buttonClasses = cN({
			'button': true,
			'disabled': (!this.state.name && !this.state.nameInitials && !this.state.color),
			'colorfull': (this.state.name || this.state.nameInitials || this.state.color),
			'save-button': true,
			'create-user-button': true
		});
		return(
			<fb className={this.outsidefbClasses}>
				<input className={cN({'user-name-input': true, 'highlighted': (!this.state.name && this.state.someInputMissing)})}type="text" value={this.state.name} placeholder="Neuer Nutzername" onChange={this.nameChanged.bind(this)}/>
				<div className={cN({'color-box': true, 'highlighted': (!this.state.color && this.state.someInputMissing)})} onClick={this.openPickColorPopup} style={{background: this.state.color }}></div>
				<input className={cN({'user-initial-input': true, 'short': true, 'highlighted': ((this.state.nameInitials.length < 4) && this.state.someInputMissing)})} type="text" value={this.state.nameInitials} placeholder="Init" maxLength="4" onChange={this.initialsChanged.bind(this)}/>
				<button onClick={this.onButtonClicked.bind(this)} className={buttonClasses}>Nutzer Erstellen</button>
			</fb>
	    );
	}
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		addNewUser,
		openPopup
	}, dispatch);
};

const mapStateToProps = (state) => {
	return {
	};
};


export default connect(null, mapDispatchToProps)(CreateUserElement);
