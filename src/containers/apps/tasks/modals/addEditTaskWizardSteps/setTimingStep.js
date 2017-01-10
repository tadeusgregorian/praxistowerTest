import React, { Component, PropTypes } from 'react';
import cN from 'classnames';
import DatePicker from 'material-ui/DatePicker';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';
import Checkbox from 'material-ui/Checkbox'
import Divider from 'material-ui/Divider';
import { TaskType, Wochentage } from './constants';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import _ from 'lodash';
import { wizardStepStateGenerator, wizardStepStatePropertyGenerator } from 'helpers/index';
import 'styles/modals.scss';

export default class SetTimingStep extends Component {
	constructor(props) {
        super(props);
		this.state = wizardStepStateGenerator(props, [
			{ name: "type", defaultValue: TaskType.onetimer },
			{ name: "isDeadline", defaultValue: false },
			{ name: "includeSaturday" },
			{ name: "includeSunday" },
			{ name: "weekly", defaultValue: [] },
			{ name: "monthly", defaultValue: [] },
			{ name: "irregularDates", defaultValue: [Date.create().shortISO()] },
			{ name: "yearly", defaultValue: [Date.create().shortISO()] },
			{ name: "alertDaysBeforeDeadline", defaultValue: 5 },
			{ name: "startDate", defaultValue: Date.create().iso() },
			{ name: "withStartDate", defaultValue: true, forceBool: true },
			{ name: "withEndDate", defaultValue: wizardStepStatePropertyGenerator(props, "endDate", false, true), forceBool: true },
			{ name: "endDate" },
			{ name: "onetimerDate", defaultValue: Date.create().iso() },
			{ name: "hour", defaultValue: 8 },
			{ name: "minute", defaultValue: 0 },
			{ name: "withDetailedTime"},
			{ name: "repeatEvery", defaultValue: 1 },
			{ name: "preponeSunday" },
			{ name: "preponeSaturday" },
			{ name: "preponeHoliday" },
		]);

		if (this.state.type == TaskType.weekly) {
			this.state.preponeHoliday = false;
		} else if (this.state.type == TaskType.monthly) {
			this.state.preponeHoliday = true;
			this.state.preponeSaturday = true;
			this.state.preponeSunday = true;
		} else if (this.state.type == TaskType.yearly) {
			this.state.preponeHoliday = true;
			this.state.preponeSaturday = true;
			this.state.preponeSunday = true;
		} else if (this.state.type == TaskType.daily) {
			this.state.preponeHoliday = false;
		}
    }

	static contextTypes = {
    	muiTheme: PropTypes.object.isRequired
    };

	safeAndNextStep = () => {

		this.props.setSubState({ ...this.state });
		this.props.nextStep();
	}

	cleanAndPreviousStep = () => {
		// Cleaning up the state instead of saving it
		this.props.setSubState({ });
		this.props.previousStep();
	}

	renderPreponeSpecialDayBox(specialDayType, labelText) {
		let statePropertyString = "prepone" + specialDayType.capitalize();
		return (
				<fb className="margin-top no-shrink no-grow">
					<Checkbox
						onClick={() => this.setState({[statePropertyString]: !this.state[statePropertyString]})}
						checked={this.state[statePropertyString]}
						label={labelText}
					/>
				</fb>
		)
	}

	renderDetailedTime() {
		const baseHours = _.range(8, 25, 1);
		const baseMinutes = _.range(0, 61, 5);
		return (
			<fb className="horizontal">
				<fb className="no-shrink no-grow a-center" style={{minWidth: "140px"}}>
					<Toggle
						  label="Mit Uhrzeit"
						  labelPosition="right"
						  onClick={() => this.setState({withDetailedTime: !this.state.withDetailedTime})}
						  toggled={!!this.state.withDetailedTime}
						/>
				</fb>
				{ this.state.withDetailedTime ? (
					<fb className={cN({
						offset: true,
						slim: true,
						'only-horizontal': true,
						'a-center': true,
						'disabled': !this.state.withDetailedTime
					})}>
						<select multiple={false} value={this.state.hour} onChange={(e) => this.setState({hour: e.target.value})}>
							{baseHours.map(h => (
								<option key={h} value={h}>{h}</option>
							))}
						</select>
						:
						<select multiple={false} value={this.state.minute} onChange={(e) => this.setState({minute: e.target.value})}>
							{baseMinutes.map(m => (
								<option key={m} value={m}>{m}</option>
							))}
						</select>
					</fb>
				) : null}
			</fb>
		);
	}

	toggleWeekday(wd) {
		const weekSorter = { "Mo":1,"Di":2,"Mi":3,"Do":4,"Fr":5,"Sa":6,"So":7 }
		let weekly = [...this.state.weekly];
		if (weekly.find(wd)) {
			weekly.remove(wd);
		} else {
			weekly.push(wd);
		}
		weekly.sort((a,b) =>  {
			return (weekSorter[a] > weekSorter[b])
		})

		console.log(weekly)
		this.setState({	weekly });
	}

	toggleMonthday(md) {
		let monthly = [...this.state.monthly];
		if (monthly.find(md)) {
			monthly.remove(md);
		} else {
			monthly.push(md);
		}

		monthly.sort((a,b) => a > b );
		this.setState({monthly});
	}

	renderOneTimerSelector() {
		return (
			<fb className="vertical">
				<header><h3>Datum auswählen</h3></header>
				<content>
					<fb className="vertical">
						{ this.renderWithDateBox("onetimerDate", "onetimerDate", "Datum", true) }
						<fb className="margin-top panel">
							{this.renderDetailedTime()}
					  	</fb>
						<fb className="margin-top padding-top"><Checkbox
								onClick={() => this.setState({isDeadline: !this.state.isDeadline})}
								checked={this.state.isDeadline}
								label="als Deadline"
							/></fb>
						{this.state.isDeadline ?
							<fb className="materialUiMenuContainer margin-bottom no-grow no-shrink">
								<DropDownMenu maxHeight={300} value={this.state.alertDaysBeforeDeadline} onChange={(e, i, v) => this.setState({alertDaysBeforeDeadline: v})}>
									{_.range(1, 31).map(i => (
										<MenuItem value={i} key={i} primaryText={`${i} Tage vor Deadline Anzeigen`} />
									))}
								</DropDownMenu>
							</fb>
						: null}
					</fb>
				</content>
				<footer>{ this.props.initData ? null :
					(<RaisedButton className="left" primary={true} label="Zurück" onClick={this.cleanAndPreviousStep.bind(this)} />) }
					<RaisedButton className="right" primary={true} disabled={!this.state.onetimerDate} label="Weiter" onClick={this.safeAndNextStep} />
				</footer>
			</fb>
		);
	}

	// "stateValue" means endDate or startDate or oneTimerdate
	renderWithDateBox = (stateValue, withStateValue, labelText, withoutToggle, disabled) => {
		if (stateValue == "startDate" && this.props.initData && this.props.initData.originalStartDate) {
			stateValue = "originalStartDate";
		}
		return (
			<fb className="horizontal _1-of-2 no-shrink">
					{ !withoutToggle ?
						<fb className="no-shrink margin-right no-grow dateToggle">
							<Toggle
								  label={"Mit " + labelText}
								  labelPosition="right"
								  onClick={() => this.setState({
									  [stateValue]: Date.create().iso(),
									  [withStateValue]: !this.state[withStateValue]})}
								  toggled={!!this.state[withStateValue]}
								/>
							</fb>
					 : null }
					{
						this.state[withStateValue] ?
						<fb className="dateBoxWrapper">
							<DatePicker
									disabled={!!disabled}
									value={Date.create(this.state[stateValue])}
									onChange={(e, d) => this.setState({[stateValue]: d.iso()})}
									autoOk={true}
									floatingLabelText={labelText}
									okLabel="OK"
									cancelLabel="Abbrechen"
									DateTimeFormat={DateTimeFormat}
									locale="de-DE"
							  />
						  </fb>
						: null
					}
			</fb>
		)
	}

	renderReapeatEveryBox = (defaultLabelText, labelText) => {
		return (<fb className="materialUiMenuContainer margin-top">
			<DropDownMenu maxHeight={300} value={this.state.repeatEvery} onChange={(e, i, v) => this.setState({repeatEvery: v})}>
				{_.range(1, 13).map(i => {
					let primaryText = i == 1 ? defaultLabelText : `Alle ${i} ${labelText}`
					return (<MenuItem value={i} key={i} primaryText={primaryText} />)
				})}
			</DropDownMenu>
		</fb>)
	}

	renderWeeklySelector() {
		return (
			<fb className="vertical">
				<header><h3>Wochentage auswählen</h3></header>
				<content>
					<fb className="horizontal padding-bottom">
						<fb className="weekdays offset only-horizontal slim">
							{Wochentage.map(w => (<fb
								key={w}
								className={(cN({weekdayBox: true, selected: this.state.weekly.find(w)}))}
								onClick={() => this.toggleWeekday(w)}
								style={{borderColor: this.state.weekly.find(w) ? this.context.muiTheme.palette.primary1Color : "#BBBBBB"}}
								>{w}</fb>))}
						</fb>
					</fb>
					<fb>
					{ this.renderReapeatEveryBox("Jede Woche", "Wochen") }
					{ this.renderWithDateBox("startDate", "withStartDate", "Startdatum", true, this.props.initData) }
					</fb>
					<fb className="margin-top panel no-shrink">
					{ this.renderWithDateBox("endDate", "withEndDate", "Enddatum") }
					</fb>
					<fb className="margin-top panel no-shrink">
						{this.renderDetailedTime()}
					</fb>
				</content>
				<footer>{ this.props.initData ? null :
					(<RaisedButton className="left" primary={true} label="Zurück" onClick={this.cleanAndPreviousStep.bind(this)} />) }
					<RaisedButton className="right" primary={true} disabled={_.isEmpty(this.state.weekly)} label="Weiter" onClick={this.safeAndNextStep} />
				</footer>
			</fb>
		);
	}

	renderDailySelector() {
		return (
			<fb className="vertical">
				<header><h3>Tägliche Aufgabe</h3></header>
				<content>
					<fb className="margin-top"><Checkbox
							onClick={() => this.setState({includeSaturday: !this.state.includeSaturday})}
							checked={this.state.includeSaturday}
							label="Inklusive Samstag"
						/></fb>
						<fb className="margin-top"><Checkbox
							onClick={() => this.setState({includeSunday: !this.state.includeSunday})}
							checked={this.state.includeSunday}
							label="Inklusive Sonntag"
						/></fb>
					<fb className="margin-top">{ this.renderWithDateBox("startDate", "withStartDate", "Startdatum", true, this.props.initData) }</fb>
					<fb className="margin-top panel">{ this.renderWithDateBox("endDate", "withEndDate", "Enddatum") }</fb>
					<fb className="margin-top panel">{this.renderDetailedTime()}</fb>
				</content>
				<footer>{ this.props.initData ? null :
					(<RaisedButton className="left" primary={true} label="Zurück" onClick={this.cleanAndPreviousStep.bind(this)} />) }
					<RaisedButton className="right" primary={true} label="Weiter" onClick={this.safeAndNextStep} />
				</footer>
			</fb>
		);
	}

	renderYearlySelector() {
		return (
			<fb className="vertical">
				<header><h3>Jährliche Aufgaben</h3></header>
				<content>
					<fb className="margin-bottom wrap overflowY offset only-horizontal no-grow no-shrink">
						{this.state.yearly.map((d, i) =>
							(<fb key={i} style={{paddingBottom: "2px"}}><DatePicker
									value={Date.create(d)}
									formatDate={(d) => d.format("{dd}. {Month}")}
									onChange={(e, d) => {
										let yearliesClone = [...this.state.yearly]
										yearliesClone[i] = d.shortISO()
										this.setState({yearly: yearliesClone})
									}}
									minDate={Date.create(`01-01-${Date.create().getFullYear()}`)}
						            maxDate={Date.create(`31-12-${Date.create().getFullYear()}`)}
									disableYearSelection={true}
									autoOk={true}
									floatingLabelText={`${(i + 1)}. jährlicher Tag`}
									okLabel="OK"
									cancelLabel="Abbrechen"
									DateTimeFormat={DateTimeFormat}
									locale="de-DE"
							  /><icon onClick={() => {
								  let yearliesClone = [...this.state.yearly]
								  yearliesClone.removeAt(i)
								  this.setState({yearly: yearliesClone})
							  }} className="icon icon-remove_circle no-border"/></fb>)
						)}
					</fb>
					<fb className="no-shrink no-grow">
						<RaisedButton
							label="Weiteren Tag hinzufügen"
							onClick={() => this.setState({yearly: [...this.state.yearly, Date.create().iso()]})}
							icon={<FontIcon className="icon icon-add_circle"/>}
						/>
					</fb>
					<fb className="no-grow no-shrink">
						{ this.renderReapeatEveryBox("Jedes Jahr", "Jahre") }
						{ this.renderWithDateBox("s", "withStartDate", "Startdatum", true, this.props.initData) }
					</fb>
					<fb className="margin-top no-shrink panel">{ this.renderWithDateBox("endDate", "withEndDate", "Enddatum") }</fb>
					<fb className="margin-top no-shrink panel">{this.renderDetailedTime()}</fb>
				</content>
				<footer>{ this.props.initData ? null :
					(<RaisedButton className="left" primary={true} label="Zurück" onClick={this.cleanAndPreviousStep.bind(this)} />) }
					<RaisedButton className="right" primary={true} disabled={!this.state.yearly.length} label="Weiter" onClick={this.safeAndNextStep} />
				</footer>
			</fb>
		);
	}

	renderIrregularSelector() {
		return (
			<fb className="vertical">
				<header><h3>Unregeläßige Aufgaben</h3></header>
				<content>
					<fb className="margin-bottom wrap overflowY offset only-horizontal">
						{this.state.irregularDates.map((d, i) =>
							(<fb key={i} style={{paddingBottom: "2px"}}><DatePicker
									value={Date.create(d)}
									onChange={(e, d) => {
										let irregularDatesClone = [...this.state.irregularDates]
										irregularDatesClone[i] = d.shortISO()
										this.setState({irregularDates: irregularDatesClone})
									}}
									autoOk={true}
									floatingLabelText={`${(i + 1)}. Datum`}
									okLabel="OK"
									cancelLabel="Abbrechen"
									DateTimeFormat={DateTimeFormat}
									locale="de-DE"
							  /><icon onClick={() => {
								  let irregularDatesClone = [...this.state.irregularDates]
								  irregularDatesClone.removeAt(i)
								  this.setState({irregularDates: irregularDatesClone})
							  }} className="icon icon-remove_circle no-border"/></fb>)
						)}
					</fb>
					<fb className="no-shrink margin-bottom">
						<RaisedButton
							label="Weiteres Datum hinzufügen"
							onClick={() => this.setState({irregularDates: [...this.state.irregularDates, Date.create().iso()]})}
							icon={<FontIcon className="icon icon-add_circle"/>}
						/>
					</fb>
					<fb className="margin-top no-shrink panel">{this.renderDetailedTime()}</fb>
				</content>
				<footer>{ this.props.initData ? null :
					(<RaisedButton className="left" primary={true} label="Zurück" onClick={this.cleanAndPreviousStep.bind(this)} />) }
					<RaisedButton className="right" primary={true} disabled={!this.state.irregularDates.length} label="Weiter" onClick={this.safeAndNextStep} />
				</footer>
			</fb>
		);
	}

	renderMonthlySelector() {
		const monthdays = _.range(1, 32, 1);
		let relevantMonthlength = null;

		if(this.state.monthly.find(31)) relevantMonthlength = 31;
		if(this.state.monthly.find(30)) relevantMonthlength = 30;
		if(this.state.monthly.find(29)) relevantMonthlength = 29;

		return (
			<fb className="vertical">
				<header><h3>Tage im Monat auswählen</h3></header>
				<content>
					<fb className="monthdays offset slim wrap margin-bottom no-grow no-shrink">
						{monthdays.map(w => (<fb
							key={w}
							className={(cN({monthdayBox: true, selected: this.state.monthly.find(w)}))}
							style={{borderColor: this.state.monthly.find(w) ? this.context.muiTheme.palette.primary1Color : "#BBBBBB"}}
							onClick={() => this.toggleMonthday(w)}
							>{w}</fb>))}
					</fb>
					{  relevantMonthlength ?
							<fb className="margin-top panel no-grow no-shrink infoText">
								<icon className="no-border icon-warning-2 no-padding margin-right"></icon>An Monaten mit weniger als {relevantMonthlength} Tagen, wird die Aufgabe automatisch vorgezogen.
							</fb>
						 :  null
					}
					<fb className="no-grow no-shrink">
						{ this.renderReapeatEveryBox("Jeden Monat", "Monate") }
						{ this.renderWithDateBox("startDate", "withStartDate", "Startdatum", true, this.props.initData) }
					</fb>
					<fb className="margin-top panel no-grow no-shrink">
						{ this.renderWithDateBox("endDate", "withEndDate", "Enddatum") }
					</fb>
					<fb className="margin-top panel no-grow no-shrink panel">
						{this.renderDetailedTime()}
					</fb>
				</content>
				<footer>{ this.props.initData ? null :
					(<RaisedButton className="left" primary={true} label="Zurück" onClick={this.cleanAndPreviousStep.bind(this)} />) }
					<RaisedButton className="right" primary={true} disabled={_.isEmpty(this.state.monthly)} label="Weiter" onClick={this.safeAndNextStep} />
				</footer>
			</fb>
		);
	}

	render() {
		console.log(this.state)
		switch (this.state.type) {
			case TaskType.onetimer: return this.renderOneTimerSelector();
			case TaskType.weekly: return this.renderWeeklySelector();
			case TaskType.monthly: return this.renderMonthlySelector();
			case TaskType.daily: return this.renderDailySelector();
			case TaskType.yearly: return this.renderYearlySelector();
			case TaskType.irregular: return this.renderIrregularSelector();
			default: return null;
		}
	}
}
