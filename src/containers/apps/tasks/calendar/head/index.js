import cN  from 'classnames';
import React  from 'react';
import {Component} from 'react';
import './styles.scss';
import Paging from './paging';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import OpenTasksFromPastPopup from '../../modals/openTasksFromPastPopup';
import OpenTasksFromPastBlock from './openTasksFromPastBlock';
import Dialog from 'material-ui/Dialog';
import {GT_dialogStyles} from 'helpers/index';



export default class DayHead extends Component {
	constructor(props) {
		super(props)
		this.state = {
			openTasksFromPastPopupIsOpen: false
		}
		console.log(props)
	}

	openOpenTasksFromPastPopup = () => {
		this.setState({openTasksFromPastPopupIsOpen: true});
	}

	closeOpenTasksFromPastPopup = () => {
		this.setState({openTasksFromPastPopupIsOpen: false});
	}

	getOpenTasksFromPast = () => {
		return this.props.forgottenTasksFromPast
	}

	render(){ return (
		<fb className="head">
			<fb className="a-center">
				<fb className="date"> {this.props.date.format('{weekday} {dd}')}. {this.props.date.format('{Mon}').toUpperCase()}</fb>
				{this.props.isFuture ?
					<fb className="futurePastIndicator">ZUKUNFT</fb>
				:
					<OpenTasksFromPastBlock
						clickHandler={() => this.openOpenTasksFromPastPopup(this.props.forgottenTasksFromPast)}
						numberOfForgottenTasks={this.props.forgottenTasksFromPast.length}
					/>
			  }
			</fb>
			<fb className="dayControl">
				<Paging clickHandler={() => this.props.onPagingHandler(-1)} direction={"left"} />
					<button
						onClick={this.props.jumpToToday}
						disabled={this.props.isToday}
						className={cN({'disabled':this.props.isToday, 'jumpToTodayButton':true})}
					>Heute</button>
					<icon
						onClick={this.props.jumpToDate}
						className="icon-calendar icon jumpToDateIcon"
					/>
				<Paging clickHandler={() => this.props.onPagingHandler(1)} direction={"right"} />
			</fb>
			<Dialog
					style={{ zIndex: 800 }}
					className="materialDialog"
					contentStyle={GT_dialogStyles}
					open={this.state.openTasksFromPastPopupIsOpen}
					onRequestClose={this.closeOpenTasksFromPastPopup}>
					<OpenTasksFromPastPopup
						user={this.props.user}
						getOpenTasksFromPast={this.getOpenTasksFromPast}
						close={this.closeOpenTasksFromPastPopup}
						openCheckUncheckTaskPopup={this.props.openCheckUncheckTaskPopup}/>
				</Dialog>
		</fb>
	)}
}
