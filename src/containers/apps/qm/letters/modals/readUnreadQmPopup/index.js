'use strict'
import classNames from 'classnames'
import {Howl} from 'howler'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import FontIcon from 'material-ui/FontIcon'
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import toastr from 'toastr'
import {readQm, unreadQm} from 'actions/index'
import composePopup from 'composers/popup';
import AssignedUsers from 'components/assignedUsers';
import 'styles/modals.scss';
import './styles.scss';
import { Storage } from '../../../../../../firebaseInstance';
import { downloadFile } from 'helpers/index'

class ReadUnreadQmPopup extends Component {
	constructor(props) {
		super(props);

		this.readerIsCreator = this.props.user.ID == this.props.qmData.creatorID;
		this.state = {
			downloadLinksForAttachments: []
		}
	}

	componentDidMount() {
		this.props.qmData.files && this.props.qmData.files.forEach(f => {
			Storage.ref(`qm/${f.guid}`).child(f.name).getDownloadURL().then(url => {
				this.setState({downloadLinksForAttachments: [...this.state.downloadLinksForAttachments, {...f, url}]})
			})
		})
	}


	readUnread() {
		if (this.props.isBusy)
			return;
		this.props.busy(true);
		var sound = new Howl({
			src: ['sounds/checkSound1.mp3'],
			sprite: {
				check: [100, 99999]
			},
			volume: 0.3
		}).play("check");
		if (this.props.unread) {
			this.props.unreadQm(this.props.qmData.ID, this.props.user.ID).then(() => {
				toastr.success("Ungelesen");
				this.props.close();
			}).catch((e) => {
				toastr.error("Ein Fehler ist aufgetreten: " + e);
				this.props.close();
			})
		} else {
			this.props.readQm(this.props.qmData.ID, this.props.user.ID).then(() => {
				toastr.success("Gelesen");
				this.props.close();
			}).catch((e) => {
				toastr.error("Ein Fehler ist aufgetreten: " + e);
				this.props.close();
			})
		}
	}



	tryToDownloadFile = (f) => {
		console.log("trying to download file");
		let filteredUrls = this.state.downloadLinksForAttachments.filter(a => a.guid == f.guid)
		let filteredFile = filteredUrls.length && filteredUrls[0]
		if (filteredFile) {
			downloadFile(filteredFile.url, filteredFile.name);
		}
	}

	tryToOpenPDF = (f) => {
		let filteredUrls = this.state.downloadLinksForAttachments.filter(a => a.guid == f.guid)
		let filteredUrl = filteredUrls.length && filteredUrls[0].url
		if (filteredUrl) {
			window.open(filteredUrl)
		}
	}

	render() {
		return (
			<fb className="readUnreadQmPopup">
				<header>
					<h4 style={{color: this.props.qmData.isUrgent ? 'red' : ''}}>{this.props.qmData.subject}</h4>
					<fb className="assignedUsersWrapper">
						<AssignedUsers assignedUsers={this.props.qmData.assignedUsers} usersRed={this.props.qmData.usersRed} maxDisplayedMiniUsers={40} />
					</fb>
				</header>
				<content>
					<p>{this.props.qmData.text}</p>
					{this.props.qmData.files && this.props.qmData.files.map(f => {
						const fileIsViewable = f.name.last(4) == ".pdf";
						return (
							<fb key={f.name + f.uploadTime + f.size} className="file downloadable">

							<FlatButton
								primary={true}
								className="iconButton"
								onClick={() => this.tryToDownloadFile(f)}
								icon={<FontIcon className="icon icon-download" />} />
								{ fileIsViewable ?
									<FlatButton
										primary={true}
										className="iconButton"
										onClick={() => this.tryToOpenPDF(f)}
										icon={<FontIcon className="icon icon-eye" />} />
								: null}
								<fb className="name">{f.name}</fb>
							</fb>
					)})}
				</content>
				<footer>
					<div className="content-right">
					  { this.readerIsCreator ? (
							<fb className="editDeleteButtonWrapper">
								<RaisedButton
									label='bearbeiten'
									primary={true} onClick={ () => {
										this.props.openAddEditQmWizard(false, this.props.qmData)
										this.props.close();
									}}
								/>
								<RaisedButton
									label='löschen'
									primary={true} onClick={ () => {
										this.props.openDeleteQmPopup(this.props.qmData.ID)
										this.props.close();
									}}
								/>
							</fb>)
						 : null}
						<RaisedButton
							label={this.props.unread ? 'Ungelesen' : 'Gelesen'}
							primary={true} onClick={() => this.readUnread()}
							disabled={this.readerIsCreator}
						/>
					</div>
				</footer>
			</fb>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		readQm,
		unreadQm
	}, dispatch);
};

export default composePopup(connect(null, mapDispatchToProps)(ReadUnreadQmPopup));
