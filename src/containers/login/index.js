import React from 'react';
import containerComposer from 'composers/container';
import {Link} from 'react-router';
import {signInWithEmailAndPassword} from 'actions/index';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {hashHistory} from 'react-router'
import toastr from 'toastr';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import cN from 'classnames';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import TransitionGroup from 'react-addons-css-transition-group';
import './styles.scss'

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		signInWithEmailAndPassword
	}, dispatch);
};

@connect(null, mapDispatchToProps)
export default class Login extends React.Component {

	constructor() {
		super();
		this.state = {
			username: '',
			password: '',
			busy: false
		};
	}

	tryToLogin = (e) => {
		e.preventDefault();
		this.busy(true);
		this.props.signInWithEmailAndPassword({
			email: this.state.username + '@mail.de',
			password: this.state.password
		}).then(() => {
			hashHistory.push("/");
		}).catch((e) => {
			this.busy(false);
			toastr.error("Nutzername oder Passwort falsch");
		});
	}

	busyStyle = {
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
		zIndex: 999999
	};

	busy = (b) => {
		this.setState({busy: b});
	}

	render() {
		return (
			<MuiThemeProvider>
				<fb style={{
					height: "100%"
				}} className={cN({busy: this.state.busy, canBusy: true})}>
					<TransitionGroup transitionName="busyLoader" transitionAppear={true} transitionAppearTimeout={150} transitionEnterTimeout={0} transitionLeaveTimeout={100} max={2} min={2} size={2}>
						{this.state.busy
							? (<RefreshIndicator style={this.busyStyle} size={80} left={100} top={100} status="loading"/>)
							: null}
					</TransitionGroup>
					<fb className="vertical" id="login">
						<header className="a-center j-center title">apoTower</header>
						<form className="login-container vertical" onSubmit={this.tryToLogin}>
							<TextField type="text" floatingLabelText="Benutzername" value={this.state.username} onChange={e => this.setState({username: e.target.value})}/>
							<TextField type="password" floatingLabelText="Passwort" value={this.state.password} onChange={e => this.setState({password: e.target.value})}/>
							<fb className="j-end margin-top" style={{
								width: "256px"
							}}>
								<RaisedButton type="submit" label="Einloggen" primary={true}/>
							</fb>
						</form>
					</fb>
				</fb>
			</MuiThemeProvider>
		);
	}
}
