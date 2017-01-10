import cN  from 'classnames';
import RoundCheckbox  from 'components/roundCheckbox';
import { formatHourAndMinute } from 'helpers/index';
import React, { Component, PropTypes } from 'react';
import AssignedUsers from 'components/assignedUsers';
import './styles.scss';

const Task = (props) => {
	const t = props.data;
	const { clickHandler, onCheckboxClick, withCheckbox, dateString } = props;
	let prioString = `prio-${t.prio}`
	const isShifted = t.shifted && t.shifted[t.dateString]
	return (
		<fb className="taskItemWrapper">
			{withCheckbox
				? <RoundCheckbox
						invisible={t.isIgnored || ( t.isShifted && !t.isDone ) }
						checked={t.isDone && !t.isIgnored}
						clickHandler={(e) => onCheckboxClick(t)} />
				: null}
			<fb
				className={cN({
				task: true,
				[prioString]: !(t.isDone || t.isIgnored || isShifted),
				isDone: t.isDone,
				isIgnored: t.isIgnored,
				isShifted
			})}>
				<fb className="body" onClick={clickHandler}>
					<fb className="head">
						<fb className="subject">{t.subject}</fb>
						{t.hour
							? <fb className="time">
									<icon className="icon-alarm alarm-icon"></icon>{formatHourAndMinute(t.hour, t.minute)}</fb>
							: null}
					</fb>

					{t.isPreponed ? <fb className="tag">Vorgezogen</fb> : null}
					{t.isDeadline
						? <fb
								className={cN({
								tag: true,
								deadline: t.onetimerDate == dateString
							})}>Deadline{t.onetimerDate != dateString
									? " " + Date.create(t.onetimerDate).format('{dd}. {Mon}').toUpperCase()
									: null}</fb>
						: null}
					{(t.isIgnored || t.isShifted)
						? <fb className="tag">{t.isIgnored
									? "ignoriert"
									: (t.isShifted
										? "verschoben"
										: null)}</fb>
						: <AssignedUsers
							assignedUsers={t.assignedUsers}
							users={props.users}
							isDone={t.isDone}
							isDoneBy={t.isDoneBy}
							colorStyle={ t.isDone ? 'blackAndWhite' : 'colorful'}
							maxDisplayedMiniUsers={100}
							showReplacements={true}/>}
				</fb>
			</fb>
		</fb>
	);
}

export default Task;
