import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { deleteQm } from 'actions/index';
import composePopup from 'composers/popup';
import toastr from 'toastr';
import RaisedButton from 'material-ui/RaisedButton';
import 'styles/modals.scss';
import {Storage} from '../../../../../firebaseInstance';

class DeleteQmPopup extends Component {
	constructor() {
		super();
	}

	componentDidMount() {
		this.setState({qmData: this.props.qmLetters.filter(qm => qm.ID == this.props.qmID)[0]})
	}

	deleteQm = () => {
		this.props.deleteQm(this.props.qmID, this.qmWasDeleted);
	}

	qmWasDeleted = () => {
		if (this.state.qmData.files) {
			this.state.qmData.files.forEach((f) => {
				Storage.ref().child(`qm/${f.guid}/${f.name}`).delete().then(s => {})
			})
		}
		toastr.success("QM-Brief wurde gelöscht");
		this.props.close();
	}

	render() {
		return(
			<fb>
				<header><h4>QM-Brief löschen</h4></header>
				<content>
					<p>Möchten sie diesen QM-Brief wirklich löschen?</p>
				</content>
				<footer>
					<div className="content-left">
						<RaisedButton
							label='abbrechen'
							primary={true}
							onClick={this.props.close} />
					</div>
					<div className="content-right">
						<RaisedButton
							label='löschen'
							primary={true}
							onClick={this.deleteQm} />
					</div>
				</footer>
			</fb>
		);
	}
}

const mapStateToProps = (state) => {
	return {qmLetters: state.data.qmLetters};
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		deleteQm
	}, dispatch);
};


export default composePopup(connect(mapStateToProps, mapDispatchToProps)(DeleteQmPopup));
