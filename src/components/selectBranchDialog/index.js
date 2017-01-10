import React, {Component} from 'react';
import cN from 'classnames';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {selectBranch} from 'actions/index';
import composePopup from 'composers/popup';
import toastr from 'toastr'
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';

class SelectBranchDialog extends Component {
	selectBranch = (branch) => {
		this.props.selectBranch(branch)
		this.props.close()
	}

	render() {
		if (!this.props.branches || !this.props.branches.length)
			return null;
		return (
			<fb className="vertical">
				<header>
					<h3 className="textCenter">Bitte Filliale auswählen</h3>
				</header>
				<content className="j-center a-center horizontal wrap no-grow offset">
					{this.props.branches.map(b => (
						<fb className="no-grow" key={b.ID}>
							<RaisedButton label={b.name} primary={true} onClick={() => this.selectBranch(b)}/>
						</fb>
					))
}
				</content>
			</fb>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		selectBranch
	}, dispatch);
};

const mapStateToProps = state => {
	return {branches: state.data.branches}
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectBranchDialog);
