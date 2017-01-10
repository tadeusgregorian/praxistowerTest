import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon'
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import {hashHistory} from 'react-router';
import { darkenColor } from 'helpers/index';
import './styles.scss';
import _ from 'lodash';
import { Link } from 'react-router';
import routes from '../../../routes';
import { getUnreadQmLetters } from 'selectors/unreadQmLettersSelector'
import cN from 'classnames';
import {openSelectUser, signOut, adminLoggedOut} from 'actions/index';

class Topbar extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			settingsPopoverIsOpen: false,
			settingsButton: null
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
	 return (this.props != nextProps) || (this.state != nextState)
	}

	goBackToHome = () => {
		if (sessionStorage.adminHash) {
			delete sessionStorage.adminHash
			this.props.adminLoggedOut();
		}
		hashHistory.push('/Apps/tasks')
	}

	static contextTypes = {
		muiTheme: PropTypes.object.isRequired
	};

	render() {
		let { pathname } = this.props.location;
		let currentApp = '';
		if( pathname.includes('Apps/Tasks/') ) { currentApp = 'task' }
		if( pathname.includes('Apps/Qm/') ) { currentApp = 'qm' }
		if( pathname.includes('Apps/Adminpanel/') ) { currentApp = 'adminpanel' }

		const {user} = this.props
		let bgColor;
		if (this.context.muiTheme.palette.primary1Color == "#656464") {
			bgColor = '#134f77';
		} else {
			bgColor = this.context.muiTheme.palette.primary1Color;
		}
		let userID = this.props.params && this.props.params.id;
		let qmNotifications = user && this.props.unreadQmLetters[user.ID];

		return (
			<fb id="topbar" className={cN({topbarBoxshadow: user ? true : false})} style={{background: bgColor, height: user ? '48px' : ''}}>
				<fb className="topbarContentWrapper">
					<fb className="left">
						{ user ? <icon className="backButton icon-arrow-left2" onClick={this.goBackToHome} /> : null }
						{ user ?
							<fb className={cN({"topbarTasksButton":true, 'selected': currentApp == 'task' ? true : false})}
									onClick={()=>{hashHistory.push('/Apps/Tasks/' + user.ID)}}>
								<icon className="icon icon-calendar2 no-border"></icon>
								<fb className="buttonText">AUFGABEN</fb>
							</fb>
						: null}
						{ user ?
							<fb className={cN({"topbarQmsButton":true, 'selected': currentApp == 'qm' ? true : false})}
							onClick={()=>{hashHistory.push('/Apps/Qm/' + user.ID)}}>
								{ qmNotifications ? <fb className="qmNotifications" >{qmNotifications}</fb> : null }
								<icon className="icon icon-mail no-border"></icon>
								<fb className="buttonText">QM BRIEFE</fb>
								</fb>
						: null}
						{user && user.adminHash ?
							<fb className={cN({"topbarAdminpanelButton":true, 'selected': currentApp == 'adminpanel' ? true : false})}
							onClick={()=>{hashHistory.push('/Apps/Adminpanel/' + user.ID)}}>
								<icon className="icon icon-cogs no-border"></icon>
								<fb className="buttonText">Adminpanel</fb>
								</fb>
						: null}
						{ this.props.selectedBranch && !user ?
							<fb className="branchLabel">
								<icon className="icon-cloud-download branchIcon"></icon>
								<fb>{this.props.selectedBranch.name}</fb>
							</fb>
						: null }
					</fb>
					<fb className="center">
					</fb>
					<fb className="right">
						<fb className="navigation">
						</fb>
						{ user ? 	<fb className="userName">{user.name}</fb> : null }
						<icon className="menuButton icon-dehaze"
									onClick={(e) => this.setState({settingsPopoverIsOpen: true, settingsButton: e.currentTarget})}
						/>
				</fb>
				<Popover
					open={this.state.settingsPopoverIsOpen}
					anchorEl={this.state.settingsButton}
					anchorOrigin={{horizontal: 'right', vertical: 'top'}}
					targetOrigin={{horizontal: 'right', vertical: 'bottom'}}
					onRequestClose={() => this.setState({settingsPopoverIsOpen: false})}>
					<Menu>
						<MenuItem primaryText="Filliale wechseln" onClick={() => {
							this.props.openSelectbranchDialog();
							this.setState({settingsPopoverIsOpen: false})
						}}/>
						<MenuItem primaryText="Abmelden" onClick={() => this.props.signOut()}/>
					</Menu>
				</Popover>
				</fb>
			</fb>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		selectedBranch: state.core.selectedBranch,
		qmLetters: state.data.qmLetters,
		users: state.data.users,
		unreadQmLetters: getUnreadQmLetters(state)
	};
};

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		signOut, openSelectUser, adminLoggedOut
	}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Topbar);
