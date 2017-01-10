import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetch } from 'redux';
import { openWizard } from 'actions/index';
import { openPopup } from 'actions/index';
import cN from 'classnames';
import { editUser } from 'actions/index';
import { deleteUser} from 'actions/index';
import {changeVacationStatusOfUser} from 'actions/index';
import PickColorPopup from 'components/pickColorPopup';
import toastr from 'toastr';
import './styles.scss';

//@param isOnVacation bool

class EditUserElement extends React.Component {
	constructor(props) {
		super(props);
	}

	changeVacationStatus = (userID, isOnVacation) => {
		this.props.changeVacationStatusOfUser(userID, isOnVacation, this.vacationStatusChanged)
	}

	vacationStatusChanged = (userIsInVacationNow) => {
		const toastrMsg = userIsInVacationNow ? " ist ab jetzt im Urlaub" : " ist nicht mehr im Urlaub."
		toastr.success(this.props.user.name+toastrMsg);
	}


	render() {
		return(
    		<fb className={'userListItem'}>
	    		<fb className="color-box" style={{background: this.props.user.color }}></fb>
					<fb className="userName">{this.props.user.name}</fb>
					<icon className={cN({	'icon-aircraft':true,
																'onVacationButton':true,
																'isOnVacation':this.props.user.isOnVacation})}
								onClick={() => this.changeVacationStatus(this.props.user.ID, !this.props.user.isOnVacation)}
					></icon>
					<button className="editUserButton" onClick={() => { this.props.editUser(this.props.user) }}>bearbeiten</button>
					<icon onClick={ () => { this.props.deleteUser(this.props.user) }} className="icon-bin delteUserButton"></icon>
    		</fb>
    	);
	}
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		changeVacationStatusOfUser
	}, dispatch);
};

export default connect(null, mapDispatchToProps)(EditUserElement);
