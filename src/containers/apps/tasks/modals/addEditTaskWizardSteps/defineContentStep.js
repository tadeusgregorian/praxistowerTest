import React, { Component, PropTypes } from 'react';
import cN from 'classnames';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { TaskType, TaskPrio } from './constants';
import 'styles/modals.scss';

export default class DefineContentStep extends Component {
	constructor(props) {
        super(props);
        this.state = {
			subject: props.subState.subject || props.initData && props.initData.subject || "",
			text: props.subState.text || props.initData && props.initData.text || "",
			prio: props.subState.prio || props.initData && props.initData.prio || TaskPrio.low,
        };
    }

	static contextTypes = {
  	muiTheme: PropTypes.object.isRequired
  };

	safeAndNextStep = () => {
		this.props.setSubState({ ...this.state });
		this.props.nextStep();
	}

	safeAndPreviousStep = () => {
		this.props.setSubState({ ...this.props.subState, ...this.state });
		this.props.previousStep();
	}

	render() {
		const disabled = !this.state.subject
		return (
			<div>
				<header><h3>Inhalt definieren</h3></header>
				<content>
					<fb className="no-shrink">
						<TextField
							autoFocus
							value={this.state.subject}
							onChange={(e) => this.setState({subject: e.target.value})}
							floatingLabelText="Betreff"
							fullWidth={true}
						/>
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
						  inputStyle={{maxHeight: "70px"}}
					    />
					</fb>
					<fb className="vertical j-center a-center margin-top no-shrink">
						<fb className="no-grow">Priorität</fb>
						<fb className="horizontal offset prios j-center">
							<button
								className={cN({selected: this.state.prio == 0})}
								onClick={() => this.setState({prio: TaskPrio.low})}
								style={{borderColor: this.state.prio == 0 ? this.context.muiTheme.palette.primary1Color : "#BBBBBB"}}
							>Keine</button>
							<button
								className={cN({selected: this.state.prio == 2})}
								onClick={() => this.setState({prio: TaskPrio.high})}
								style={{borderColor: this.state.prio == 2 ? this.context.muiTheme.palette.primary1Color : "#BBBBBB"}}
							>Hoch</button>
						</fb>
					</fb>
				</content>
				<footer>
					<RaisedButton className="left" primary={true} label="Zurück" onClick={this.safeAndPreviousStep} />
					<RaisedButton className="right" primary={true} disabled={disabled} label="Weiter" onClick={this.safeAndNextStep} />
				</footer>
			</div>
		);
	}
}
