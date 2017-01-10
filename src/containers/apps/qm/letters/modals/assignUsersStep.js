import React, {Component, PropTypes} from 'react';
import cN from 'classnames';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {createQm} from 'actions/index';
import {filterUsersByBranch, createGuid, filterUsersByGroup} from 'helpers/index';
import _ from 'lodash';
import toastr from 'toastr';
import RaisedButton from 'material-ui/RaisedButton';
import {Howl} from 'howler';
import 'styles/modals.scss';
import {Storage} from '../../../../../firebaseInstance';

class AssignUsersStep extends Component {
	constructor(props) {
		super(props);

		this.state = {
			assignedUsers: props.subState.assignedUsers || props.initData && props.initData.assignedUsers || {},
			selectedGroups: [],
			selectedBranches: [],
			usersRed: {
				0: ['-1']
			}
		}
	}


	static contextTypes = {
		muiTheme: PropTypes.object.isRequired
	};

	 onFinish() {
		if (this.props.isBusy)
			return;
		this.props.busy(true);
		const creatorID = this.props.creatorID;
		if (this.state.assignedUsers[creatorID]) {
			this.setState({
				usersRed: {
					[creatorID]: creatorID
				}
			});
		}

		const qmData = {
			...this.props.initData,
			...this.props.subState,
			...this.state,
			creatorID: this.props.creatorID
		}

		// if creator has assigned himself to the qmletter, let him have this qmletter red.
		if (qmData.assignedUsers[creatorID]) {
			qmData.usersRed = {
				[creatorID]: creatorID
			};
		}

		delete qmData.filesToUpload;
		delete qmData.selectedGroups;
		delete qmData.selectedBranches;

		let sound = new Howl({
			src: ['sounds/checkSound5.mp3'],
			sprite: {
				check: [100, 99999]
			},
			volume: 0.3
		}).play("check");

		const updateQmData = () => {
			this.props.onFinish(qmData).then(() => {
				this.props.close();
				if (this.props.initData) {
					toastr.success(`QM Brief \"${this.props.subState.subject}\" erfolgreich bearbeitet`);
				} else {
					toastr.success(`QM Brief \"${this.props.subState.subject}\" erfolgreich erstellt`);
				}

			}).catch((e) => {
				this.props.close();
				toastr.error(`Fehler beim ${this.props.initData
					? "Bearbeiten"
					: "Erstellen"} des QM Briefes: ` + e);
			});
		}



		if (this.props.subState.filesToBeDeleted.length) {
			this.props.subState.filesToBeDeleted.forEach((f) => {
				qmData.files = [...qmData.files].remove(file => file.guid == f.guid);
				Storage.ref().child(`qm/${f.guid}/${f.name}`).delete().then(s => {
				})
			})
		}

		const getPdfMedataData = (name) => ({contentType: "application/pdf", contentDisposition : "inline; filename=" + name})
		const getSimpleAttachmentMetaData = (name) => ({contentType: "application/text", contentDisposition : "attachment; filename=" + name})
		// first we upload the files when the files are uploaded we can update the qmData with the right
		// file guids
		if (this.props.subState.filesToUpload.length) {
			let processedFilesToUpload = this.props.subState.filesToUpload.map(f => ({name: f.name, guid: createGuid(), uploadTime: Date.create().iso(), size: f.size}))

			// adding the files that need to be uploaded already to the qmData object
			qmData.files = [...processedFilesToUpload, ...qmData.files];
			let readAndUploadPromises = []
			this.props.subState.filesToUpload.forEach((f, i) => {
				let fileReader = new FileReader();
				let readAndUploadPromise = new Promise((resolve, reject) => {
					fileReader.onloadend = () => {
						const fileRefForStorage = Storage.ref().child(`qm/${processedFilesToUpload[i].guid}/${f.name}`);
						// since there are some unwanted chars at the beginning of the fileReader result we need to remove them
						fileRefForStorage
							.putString(
								fileReader.result.from(fileReader.result.indexOf(',') + 1),
								'base64',
								f.name.last(4) == ".pdf" ? getPdfMedataData(f.name) : getSimpleAttachmentMetaData(f.name)
							).then(snapshot => {
							resolve(snapshot);
						}).catch(c => reject(c))
					}
					fileReader.readAsDataURL(f)
				});
				readAndUploadPromises.push(readAndUploadPromise);
			})

			// when all fileuploads are complete we update the qm object
			Promise.all(readAndUploadPromises).then((snapshot) => {
				updateQmData();
			}).catch(e => {
				toastr.error(`Fehler beim hochladen der Anhänge:` + e);
				this.props.close();
			});

		} else {
			updateQmData();
		}
	}

	safeAndPreviousStep() {
		this.props.setSubState({
			...this.state
		});
		this.props.previousStep();
	}

	selectUsersByGroup(g) {

		console.log(g)
		console.log(this.state.selectedGroups)

		let selectedGroups = _.clone(this.state.selectedGroups);
		let index = selectedGroups.indexOf(g.ID);
		if (index < 0) {
			selectedGroups.push(g.ID);
		} else {
			selectedGroups.removeAt(index);
		}

		this.setState({selectedGroups: selectedGroups})

		let selectedUsersIds = {};
		for (let i of selectedGroups) {
			let usersArray = filterUsersByGroup(this.props.users, i);
			let usersArrayFiltered = [];
			let selectedBranches =  ( this.state.selectedBranches.length > 0 ) ? this.state.selectedBranches : this.props.branches.map( b => b.ID) ;  // if non branch selected, there should be no branch filter.
			console.log(selectedBranches)
			for (let b of selectedBranches) {
				usersArrayFiltered.push(...filterUsersByBranch(usersArray, b));

			}
			for (let f of usersArrayFiltered) {
				selectedUsersIds[f.ID] = f.ID;
			}
		}

		this.setState({assignedUsers: selectedUsersIds});
	}

	selectDeselectUser(u) {
		let clonedAssignedUsers = _.clone(this.state.assignedUsers);
		if (clonedAssignedUsers[u.ID]) {
			delete clonedAssignedUsers[u.ID];
		} else {
			clonedAssignedUsers[u.ID] = u.ID;
		}
		this.setState({assignedUsers: clonedAssignedUsers})
	}

	selectUsersByBranch(b) {
		let selectedBranches = _.clone(this.state.selectedBranches);
		let index = selectedBranches.indexOf(b.ID);
		if (index < 0) {
			selectedBranches.push(b.ID);
		} else {
			selectedBranches.removeAt(index);
		}

		this.setState({selectedBranches: selectedBranches})

		let selectedUsersIds = {};
		for (let i of selectedBranches) {
			let usersArray = filterUsersByBranch(this.props.users, i);
			for (let f of usersArray) {
				selectedUsersIds[f.ID] = f.ID;
			}
		}
		this.setState({assignedUsers: selectedUsersIds});
	}

	render() {
		return (
			<div>
				<header>
					<h3>Nutzer zuweisen</h3>
				</header>
				<content>
					<fb className="user-group-wrapper" style={{borderBottom:"1px solid #adadad"}}>
						<fb className="categorie">Fillialen:</fb>
						<fb className="inner-group-wrapper">
							{this.props.branches.map(b => {
								let isSelected = (this.state.selectedBranches.indexOf(b.ID) >= 0);
								return (
									<div
										key={b.ID}
										className={cN({"user-group": true, "selected": isSelected})}
										style={{
										backgroundColor: (isSelected
											? this.context.muiTheme.palette.primary1Color
											: "#BBBBBB")
									}}
										onClick={() => this.selectUsersByBranch(b)}>
										{b.name}
									</div>
								);
							})}
						</fb>
					</fb>
					<fb className="user-group-wrapper">
						<fb className="categorie">Gruppen:</fb>
							<fb className="inner-group-wrapper">
								{this.props.groups.map(g => {
									let isSelected = (this.state.selectedGroups.indexOf(g.ID) >= 0);
									return (
										<div
											key={g.ID}
											className={cN({"user-group": true, "selected": isSelected})}
											style={{
											backgroundColor: (isSelected
												? this.context.muiTheme.palette.primary1Color
												: "#BBBBBB")
										}}
											onClick={() => this.selectUsersByGroup(g)}>
											{g.name}
										</div>
									);
								})}
						</fb>
					</fb>

					<fb className="modal-user-wrapper padding-top">
						{this.props.users.map(u => {
							let isSelected = !!(this.state.assignedUsers[u.ID]);
							return (
								<fb
									key={u.ID}
									className={cN({'modal-user': true, 'selected': isSelected})}
									style={{
									color: (isSelected
										? this.context.muiTheme.palette.primary1Color
										: "#353535"),
									borderColor: (isSelected
										? this.context.muiTheme.palette.primary1Color
										: "grey")
								}}
									onClick={() => this.selectDeselectUser(u)}>
									{u.name}
								</fb>
							);
						})}
					</fb>
				</content>
				<footer>
					<buttonWrapper className={cN({'left': true})}>
						<RaisedButton label='Zurück' primary={true} onClick={this.safeAndPreviousStep.bind(this)}/>
					</buttonWrapper>
					<buttonWrapper className={cN({'right': true})}>
						<RaisedButton
							label='Fertig'
							disabled={_.isEmpty(this.state.assignedUsers)}
							primary={true}
							onClick={this.onFinish.bind(this)}/>
					</buttonWrapper>
				</footer>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {users: state.data.users, groups: state.data.groups, branches: state.data.branches};
};

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		createQm
	}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(AssignUsersStep);
