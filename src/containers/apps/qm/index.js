import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {registerQmLettersDataListener} from 'actions/index';
import containerComposer from 'composers/container';
import './styles.scss'

@containerComposer()
class QmApp extends React.Component {
	componentWillMount() {
		if (!this.props.qmLettersListenerSet) {
			this.props.busy(true)
			this.props.registerQmLettersDataListener().then(() => this.props.busy(false));
		}
	}

	render() {
		const {user} = this.props
		return (
			<fb className="vertical qm">
				{React.cloneElement(this.props.children, {user})}
			</fb>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		registerQmLettersDataListener
	}, dispatch);
};

const mapStateToProps = (state) => {
	return {users: state.data.users, qmLettersListenerSet: state.data.listenersSet.qmLettersListenerSet};
};

export default connect(mapStateToProps, mapDispatchToProps)(QmApp);
