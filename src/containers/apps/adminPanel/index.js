import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetch } from 'redux';
import { Link } from 'react-router';
import { adminLoggedOut } from 'actions/index';
import cN from 'classnames';
import './styles.scss';


class AdminPanel extends React.Component {
	constructor(props) {
		super(props);
	}

	static contextTypes = {
		router: React.PropTypes.object
	}

	goBack = () => {
		this.context.router.push('/Apps/')
	}

	render() {
		console.log("ADMINPANEL")
		console.log(this.props.params)
		let pathname = this.props.location.pathname;
		return (
			<div className="adminpanel">
				<div className='adminpanel-body'>
					<div className='adminpanel-navbar'>
						<div className={cN({'navbar-item': true, 'selected': (pathname.includes('Users'))})} onClick={() => this.context.router.push(`/Apps/Adminpanel/${this.props.params.id}/Users/`)}>Nutzer Verwalten</div>
						<div className={cN({'navbar-item': true, 'selected': (pathname.includes('Groups'))})}  onClick={() => this.context.router.push(`/Apps/Adminpanel/${this.props.params.id}/Groups/`)} >Gruppen Verwalten</div>
						<div className={cN({'navbar-item': true, 'selected': (pathname.includes('Branches'))})}  onClick={() => this.context.router.push(`/Apps/Adminpanel/${this.props.params.id}/Branches/`)} >Filianen Verwalten</div>
					</div>
					<div className='content'>{this.props.children}</div>
				</div>
			</div>
		);
	}
}


const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		adminLoggedOut
	}, dispatch);
};

const mapStateToProps = (state) => {
	return {
		users: state.data.users,
		groups: state.data.groups
	};
};


export default connect(mapStateToProps, mapDispatchToProps)(AdminPanel);
