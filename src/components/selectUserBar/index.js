import React, {Component} from 'react';
import './styles.scss';
import { darkenColor } from 'helpers/index';
import FlatButton from 'material-ui/FlatButton';
import { Link } from 'react-router';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {hashHistory} from 'react-router'
import {closeSelectUser, signOut, adminLoggedIn, adminLoggedOut} from 'actions/index';
import EnterAdminPinPopup from 'components/enterAdminPinPopup';
import BigUserButton from 'components/bigUserButton';
import { getUnreadQmLetters } from 'selectors/unreadQmLettersSelector';
import _ from 'lodash';
import Dialog from 'material-ui/Dialog';

class SelectUserBar extends Component {
	constructor(props) {
		super(props);
		this.state = {
			enterAdminPinPopupIsOpen: false
		}
	}

	tryToOpenUserPage = (user) => {
		if (user.adminHash && (sessionStorage.getItem("adminHash") != user.adminHash)) {
			this.openEnterAdminPinPopup(user);
		} else {
			hashHistory.push('/Apps/Tasks/' + user.ID)
			this.props.closeSelectUser();
		}
	}

	openEnterAdminPinPopup = (user) => {
		this.enterAdminPinPopup = (<EnterAdminPinPopup
			user={user}
			close={this.closeEnterAdminPinPopup}
			onFinish={() => this.onFinish(user)}/>)
		this.setState({enterAdminPinPopupIsOpen: true})
	}

	onFinish = (user) => {
		this.props.adminLoggedIn();
		hashHistory.push('/Apps/Tasks/' + user.ID)
		this.props.closeSelectUser();
	}

	closeEnterAdminPinPopup = () => {
		this.setState({enterAdminPinPopupIsOpen: false})
	}

	render(){
		const {qmLetters} = this.props
		console.log(this.props)
		return(
			<fb id="selectUserBar">
				<fb className="bigUserButtonsContainer">
					{_.values(this.props.users).filter(u => u.branches && u.branches[this.props.selectedBranch.ID] ).map(u => {
						let qmNotifications = this.props.unreadQmLetters[u.ID]
						return <BigUserButton user={u} key={u.ID} clickHandler={() => this.tryToOpenUserPage(u)} qmNotifications={qmNotifications}/>
					})}
				</fb>
				<Dialog
					className="materialDialog"
					style={{zIndex: 999999999999}}
					open={this.state.enterAdminPinPopupIsOpen}
					onRequestClose={this.closeEnterAdminPinPopup}>
					{this.enterAdminPinPopup}
				</Dialog>
			</fb>
		)
	}
}



const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		closeSelectUser,
		signOut,
		adminLoggedIn,
		adminLoggedOut
	}, dispatch);
};


const mapStateToProps = (state) => {
	return {
		users: state.data.users,
		qmLetters: state.data.qmLetters,
		unreadQmLetters: getUnreadQmLetters(state)
	}
}

export default connect(mapStateToProps,mapDispatchToProps)(SelectUserBar);
