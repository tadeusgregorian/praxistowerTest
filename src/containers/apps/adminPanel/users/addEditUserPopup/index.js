import cN  from 'classnames'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addNewUser } from 'actions/index'
import { editUser } from 'actions/index'
import composePopup  from 'composers/popup';
import DropDownMenu from 'material-ui/DropDownMenu';
import ActionLabel from 'material-ui/svg-icons/action/label';
import MenuItem from 'material-ui/MenuItem';
import {userColors} from 'helpers/colors';
import './styles.scss';
import 'styles/popup.scss';

//@param user.name optional str
//@param user.nameInitials optional str (4 characters!)
//@param user.color optional str ('#fefefe')
//@param editingMode optional bool -> if true User is being edited instead of created.
//@param user.ID

class AddEditUserPopup extends Component {
	constructor(props) {
		super(props);

		this.state = {
			name: this.props.editingMode ? this.props.user.name : '' ,
			nameInitials: this.props.editingMode ? this.props.user.nameInitials : '',
			color: this.props.editingMode ? this.props.user.color : '',
			userinputMissingText: ''
		};
	}

	onFinish() {
		this.props.close(this);
	}

	onButtonClicked() {

		if(this.state.name == ''){
			this.setState({userinputMissingText: 'Bitte geben Sie einen Benutzernamen ein.'})
			return;
		}
		if(this.state.nameInitials.length < 4){
			this.setState({userinputMissingText: 'Bitte geben Sie einen 4 stelligen Namenskürzel ein.'})
			return;
		}
		if(this.state.color == ''){
			this.setState({userinputMissingText: 'Bitte wählen Sie eine Farbe aus.'})
			return;
		}

		let userObj = { ...this.props.user }
		userObj.name = this.state.name
		userObj.nameInitials = this.state.nameInitials
		userObj.color = this.state.color


		if( this.props.editingMode ){

			if(!this.props.user.ID){ return }  // in editingMode user.ID has to be existent!
			userObj.ID = this.props.user.ID; // add ID to the userObj if you want to use the editUser-Action
			this.props.editUser(userObj, this.userWasEdited.bind(this));

		} else {
			this.props.addNewUser(userObj, this.userWasAdded.bind(this));
		}
	}

	userWasAdded() {
		this.onFinish();
	}

	userWasEdited() {
		this.onFinish();
	}

	onNameInputChanged(input) {
		this.setState({name: input.target.value});
	}
	onInitialsInputChanged(input) {
		this.setState({nameInitials: input.target.value});
	}
	onColorTouchTaped(color) {
		this.setState({color});
	}

	render() {
		return (
			<div className="addEditUserPopup">
				<header>
					<h3>Neuer Benutzer</h3>
				</header>
				<fb className="popupContent">
					{ this.state.userinputMissingText ? <fb className="userinputMissingText">{this.state.userinputMissingText}</fb> : null}
					<fb className="inputItemWrapper">
						<fb className="inputDescription" >Benutzername:</fb>
						<input className="nameInputField" type="text" value={this.state.name} onChange={this.onNameInputChanged.bind(this)}/>
					</fb>
					<fb className="inputItemWrapper">
						<fb className="inputDescription">Namenskürzel:</fb>
						<input className="initialsInputField" type="text" placeholder="4 Stellig" value={this.state.nameInitials} onChange={this.onInitialsInputChanged.bind(this)} maxLength="4" />
					</fb>
					<fb className="inputItemWrapper">
						<fb className="inputDescription">Farbe wählen:</fb>
						<fb className="colorsWrapper">
						{ userColors.map((colorString) => { return (
								<fb className={cN({'userColor':true, 'selected':false})}
										style={{backgroundColor:colorString}}
										key={colorString}
										onClick={ () => this.onColorTouchTaped(colorString)} >
										{ (this.state.color == colorString) ? <icon className="icon icon-checkmark"></icon> : null}
								</fb>)})}
						</fb>
					</fb>
				</fb>
				<footer>
					<button className={cN({
						'right': true,
						'disabled': ( false )
					})} onClick={(this.onButtonClicked).bind(this)}>
						{ this.props.editingMode ? 'speichern ' : 'Nurtzer Erstellen' }
					</button>
				</footer>
			</div>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		addNewUser,
		editUser
	}, dispatch);
};

export default composePopup(connect(null, mapDispatchToProps)(AddEditUserPopup));
