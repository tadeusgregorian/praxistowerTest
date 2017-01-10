import React, {Component, PropTypes} from 'react';
import cN from 'classnames';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import 'styles/modals.scss';

export default class DefineContentStep extends Component {
	constructor(props) {
		super(props);
		this.state = {
			subject: props.subState.subject || props.initData && props.initData.subject || "",
			text: props.subState.text || props.initData && props.initData.text || "",
			isUrgent: props.subState.isUrgent || props.initData && props.initData.isUrgent || false,
			files: props.subState.files || props.initData && props.initData.files || [],
			filesToUpload: props.subState.filesToUpload || [],
			filesToBeDeleted: props.subState.filesToBeDeleted || []
		};
	}

	static contextTypes = {
		muiTheme: PropTypes.object.isRequired
	};

	safeAndNextStep() {
		this.props.setSubState({
			...this.state
		});
		this.props.nextStep();
	}

	addChosenFiles = (e, f, c) => {
		e.persist();
		this.setState({
			filesToUpload: [
				...this.state.filesToUpload,
				...e.target.files
			]
		});
	}

	removeFile = (f) => {
		if (this.state.filesToUpload.indexOf(f) > -1) {
			let filesToUploadWithoutChosenFile = [...this.state.filesToUpload].remove(f);
			this.setState({ filesToUpload: filesToUploadWithoutChosenFile })
		} else {
			this.setState({ filesToBeDeleted: [...this.state.filesToBeDeleted, f] })
		}
	}

	render() {
		const disabled = !this.state.subject;
		return (
			<div>
				<header>
					<h3>Inhalt definieren</h3>
				</header>
				<content>
					<fb className="no-shrink">
						<TextField
							autoFocus
							value={this.state.subject}
							onChange={(e) => this.setState({subject: e.target.value})}
							floatingLabelText="Betreff"
							fullWidth={true}/>
					</fb>
					<fb className="no-shrink">
						<TextField
							floatingLabelText="Details"
							value={this.state.text}
							onChange={(e) => this.setState({text: e.target.value})}
							multiLine={true}
							fullWidth={true}
							rowsMax={4}
							rows={3}
							inputStyle={{
							maxHeight: "70px"
						}}/>
					</fb>
					<fb className="no-shrink margin-top">
						<Checkbox
							label="Dringend"
							checked={this.state.isUrgent}
							onClick={() => this.setState({
							isUrgent: !this.state.isUrgent
						})}/>
					</fb>
					<fb className="no-shrink margin-top vertical">
					{this.state.files.filter(f => !this.state.filesToBeDeleted.filter(d => d.guid == f.guid).length).map(f => (
						<fb key={f.name + f.lastModified} className="file">
							<fb className="name">{f.name}</fb>
							<FlatButton
								primary={true}
								className="iconButton"
								onClick={() => this.removeFile(f)}
								icon={<FontIcon className="icon icon-close" />} />
							</fb>
					))}
						{this.state.filesToUpload.map(f => (
							<fb key={f.name + f.lastModified} className="file notUploadedYet">
								<fb className="name">{f.name}</fb>
								<FlatButton
									primary={true}
									className="iconButton"
									onClick={() => this.removeFile(f)}
									icon={<FontIcon className="icon icon-close" />} />
								</fb>
						))}
					</fb>
				</content>
				<footer>
					<RaisedButton
						primary={true}
						className="left"
						containerElement='label'
						labelPosition="before"
						style={{
						position: "relative"
					}}
						label='Dateien anhängen'
						icon={< FontIcon className = "icon icon-upload" />}>
						<input
							multiple
							onChange={(e, f, c) => this.addChosenFiles(e, f, c)}
							className="fileUpload"
							id="fileUpload"
							type="file"/>
					</RaisedButton>
					<RaisedButton
						className="right"
						label='weiter'
						disabled={disabled}
						primary={true}
						onClick={this.safeAndNextStep.bind(this)}/>
				</footer>
			</div>
		);
	}
}
