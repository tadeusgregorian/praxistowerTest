import React, { Component } from 'react';
import cN from 'classnames';
import RaisedButton from 'material-ui/RaisedButton';
import 'styles/modals.scss';

import {TaskType, Wochentage} from './constants'


export default class ChooseTypeStep extends Component {
	setTaskType(type) {
		this.props.setSubState({ type });
		this.props.nextStep();
	}

	render() {
		return (
			<div className="chooseTypeStep">
				<header>
					<h3>Typ auswählen</h3>
				</header>
				<content className="horizontal offset j-center a-center wrap">
					<fb className="nonRepetetiveTasks buttonsWrapper">
						<RaisedButton primary={true} label="Einmalig" onClick={() => this.setTaskType(TaskType.onetimer)} />
						<RaisedButton primary={true} label="Multidatum" onClick={() => this.setTaskType(TaskType.irregular)} />
					</fb>
					<fb className="repetetiveTasks buttonsWrapper">
						<RaisedButton primary={true} label="Täglich" onClick={() => this.setTaskType(TaskType.daily)} />
						<RaisedButton primary={true} label="Wöchentlich" onClick={() => this.setTaskType(TaskType.weekly)} />
						<RaisedButton primary={true} label="Monatlich" onClick={() => this.setTaskType(TaskType.monthly)} />
						<RaisedButton primary={true} label="Jährlich" onClick={() => this.setTaskType(TaskType.yearly)} />
					</fb>
				</content>
				<footer>
				</footer>
			</div>
		);
	}
}
