import { createSelectorCreator, defaultMemoize } from 'reselect'
import _ from 'lodash'
import feiertagejs from 'feiertagejs'
window.feiertagejs = feiertagejs;
import {Wochentage, TaskType} from '../containers/apps/tasks/modals/addEditTaskWizardSteps/constants';
import {filterTasksForUser} from 'helpers/index';


const MS_IN_WEEK = 7 * 24 * 60 * 60 * 1000

// --------------- MAIN FUNCTIONS

const getTasksForDay = (props) => {
	// main date object
	const d = Date.create(props.day)

	const beginningOfWeekMs = Date.create(props.day).beginningOfWeek().getTime()

	// main date object in iso large format
	const dIso = d.iso()

	// main date object in iso short format
	const dateString = d.shortISO()

	const daysInMonth = d.daysInMonth()
	const isToday = dateString == props.today

	// opt-out when there is no branch selected yet
	if (!props.selectedBranch) return [];
	const tasksFilteredByBranch = props.tasks.filter(t => t.branch === props.selectedBranch.ID);
	let tasksForCurrentDay = tasksFilteredByBranch.filter(t => {
		if (t.endDate) {
			if (!(dateString == t.endDate) && d.getTime() > Date.parse(t.endDate)) {
				return false
			}
		}

		if (t.startDate) {
			if (!(dateString == t.startDate) && d.getTime() < Date.parse(t.startDate)) {
				return false
			}
		}

		if (t.onetimerDate) {
			return dateString == t.onetimerDate || t.isDeadline && !t.shifted && ((t.checked && t.checked[dateString] || t.ignored && t.ignored[dateString]) || isToday && !t.checked && !t.ignored);
		}

		if (t.weekly) {
			if (t.repeatEvery) {
				let weekMsDifference = beginningOfWeekMs - t.beginningOfWeekMs
				if (!((weekMsDifference % (t.repeatEvery * MS_IN_WEEK)) == 0)) {
					return false
				}
			}
			return (t.weekly.find(wd => Wochentage.indexOf(wd) == d.getWeekday()));
		}

		if (t.monthly) {
			if (t.repeatEvery) {
				let yearDifference = parseInt(dateString.first(4)) - parseInt(t.originalStartDate ? t.originalStartDate.first(4) : t.startDate.first(4))
				let monthsDifference = (parseInt(dateString.substr(5,2)) - parseInt( t.originalStartDate ? t.originalStartDate.substr(5,2) : t.startDate.substr(5,2))) + (yearDifference * 12)
				if (!(monthsDifference % t.repeatEvery) == 0) {
					return false
				}
			}
			return t.monthly.find(md => {
				return md == d.getDate() || (d.getDate() == d.daysInMonth() && md > d.daysInMonth())
			})
		}

		if (t.yearly) {
			if (t.repeatEvery) {
				let yearDifference = parseInt(dateString.first(4)) - parseInt(t.originalStartDate ? t.originalStartDate.first(4) : t.startDate.first(4))
				if (!(yearDifference % t.repeatEvery) == 0) {
					return false
				}
			}
			return t.yearly.find(yD => yD.substr(5, 8) == dateString.substr(5, 8))
		}

		if (t.irregularDates) {
			return t.irregularDates.find(iD => iD == dateString)
		}

		if (t.type == TaskType.daily
			&& (t.includeSaturday || Wochentage.indexOf("Sa") != d.getWeekday())
			&& (t.includeSunday || Wochentage.indexOf("So") != d.getWeekday())) {
			return true;
		}

		return false;
	});

	// we add some additional computed info to the single tasks so we don't have to do this on the views multiple times
	let proccessedTasksForCurrentDay = tasksForCurrentDay.map(t => proccessTask(t, {d, dIso, props}));


	if (props.filterCheckedAndIgnored) {
		proccessedTasksForCurrentDay = proccessedTasksForCurrentDay.filter(t => !t.isDone && !t.isIgnored && !t.isShifted)
	}

	// when the current day is not calculated for a forgottenTasks- or possiblyPreponingFutureTasksDay,
	// we check the days after the current day for future tasks which should be preponed to the current day
	if (!props.isPastOrFutureTasksDayGetter) {
		let tasksFromFuture = [];

		// we are going recursivly through the future days and check if the day is preponeable
		// and if the day has preponeble tasks which need to be preponed
		// additionaly we have to filter in each recursive step if a future preponing task could fall on a future day
		let getFutureTasksForDate = (date) => {
			let theDayAfter = Date.create(date.iso()).addDays(1)
			if (isDateOnWeekendOrHoliday(theDayAfter)) {
				return getTasksForDay({...props, day: date.iso(), isPastOrFutureTasksDayGetter: true})
					.filter(t => checkIfTaskIsPreponeable(t))
					.map(t => proccessTask(t, {d, dIso, props}))
					.add(getFutureTasksForDate(theDayAfter))
					.filter(t => checkIfPreponingTaskCanNotFallOnDate(t, date))
			} else {
				return getTasksForDay({...props, day: date.iso(), isPastOrFutureTasksDayGetter: true})
					.filter(t => checkIfTaskIsPreponeable(t))
					.filter(t => checkIfPreponingTaskCanNotFallOnDate(t, date))
					.map(t => proccessTask(t, {d, dIso, props}))
			}
		}

		if (isDateOnWeekendOrHoliday(Date.create(props.day).addDays(1))) {
			tasksFromFuture.append(getFutureTasksForDate(Date.create(props.day).addDays(1)));
		}

		tasksFromFuture = tasksFromFuture.map((t) => {
			return {...t, isPreponed: true}
		})

		const proccessedTasksForCurrentDayWithFutureTasks = proccessedTasksForCurrentDay.add(tasksFromFuture).filter(t => {
			if (d.getDay() == 0 && t.preponeSunday) { return false }
			if (d.getDay() == 6 && t.preponeSaturday) { return false }
			if (feiertagejs.isHoliday(d, "HH") && t.preponeHoliday) { return false }
			return true;
		})

		return proccessedTasksForCurrentDayWithFutureTasks;
	} else {
		return proccessedTasksForCurrentDay;
	}
}

// --------------- HELPER
const checkIfTaskIsPreponeable = t => t.preponeSunday || t.preponeHoliday || t.preponeSaturday;
const checkIfPreponingTaskCanNotFallOnDate = (t, date) => {
	if ((!t.preponeSunday && date.getDay() == 0)
		&& (!t.preponeHoliday || !feiertagejs.isHoliday(date, "HH"))) {
		return false
	}

	if ((!t.preponeSaturday && date.getDay() == 6)
		&& (!t.preponeHoliday || !feiertagejs.isHoliday(date, "HH"))) {
		return false
	}

	if ((!t.preponeHoliday && feiertagejs.isHoliday(date, "HH"))) {
		return false
	}

	return true;
}

const proccessTask = (t, context) => {
	let clonedTask = {...t};
	if (clonedTask.replacements && _.keys(clonedTask.replacements).first(r => context.props.usersOnVacation.find(r))) {
		clonedTask.assignedUsers = replaceUsersOnVacation(clonedTask.assignedUsers, clonedTask.replacements, context.props.usersOnVacation)
	}
	clonedTask['dateString'] = context.d.shortISO()
	clonedTask['date'] = context.dIso;
	clonedTask['isDone'] = clonedTask.checked
		&& (clonedTask.checked[clonedTask.dateString]
		|| (clonedTask.isDeadline && _.values(clonedTask.checked).length));

	clonedTask['isDoneBy'] = clonedTask['isDone']
		&& (((clonedTask.checked[clonedTask.dateString] && ((clonedTask.checked[clonedTask.dateString].checkerID))))
		|| (clonedTask.isDeadline && _.values(clonedTask.checked)[0] && _.values(clonedTask.checked)[0].checkerID));

	clonedTask['isShifted'] = clonedTask.shifted && clonedTask.shifted[clonedTask.dateString];
	clonedTask['isIgnored'] = clonedTask.ignored && (clonedTask.ignored[clonedTask.dateString]);
	clonedTask['isIgnoredBy'] = (clonedTask['isIgnored']) && (clonedTask.ignored[clonedTask.dateString].checkerID);

	clonedTask['isDoneDate'] = clonedTask['isDone'] && clonedTask.checked[clonedTask.dateString] && clonedTask.checked[clonedTask.dateString].date
	clonedTask['isIgnoredDate'] = clonedTask['isIgnored'] && clonedTask.ignored[clonedTask.dateString] && clonedTask.ignored[clonedTask.dateString].date
	return clonedTask;
}

const isDateOnWeekendOrHoliday = (date) => {
	return date.getDay() == 0 || date.getDay() == 6 || feiertagejs.isHoliday(date, "HH");
}

const getDataToComputeForgottonTasks = (tasks, day, selectedBranch, usersOnVacaction) => {
    return {
        tasks,
        selectedBranch,
        day,
        usersOnVacaction
    }
}

const getDataToComputeTasksForDay = (tasks, day, selectedBranch, today, usersOnVacation, filterCheckedAndIgnored, isPastOrFutureTasksDayGetter) => {
    return {
        tasks,
        selectedBranch,
        day,
		today,
        usersOnVacation,
		filterCheckedAndIgnored,
		isPastOrFutureTasksDayGetter
    }
}

const createDeepEqualTasksDaySelector = createSelectorCreator(
    defaultMemoize,
    (x, y) => {
        return x.tasks === y.tasks
			&& x.day === y.day
			&& x.selectedBranch === y.selectedBranch
            && x.usersOnVacaction === y.usersOnVacaction
			&& x.today == y.today
    }
)

const createDeepEqualForgottenTasksSelector = createSelectorCreator(
    defaultMemoize,
    (x, y) => {
        return x.tasks === y.tasks
			&& x.day === y.day
            && x.users === y.users
			&& x.selectedBranch === y.selectedBranch
    }
)

const replaceUsersOnVacation = (assignedUsersObj, replacements, usersOnVacation) => {
    let clonedAssignedUsersObj = {...assignedUsersObj}
    usersOnVacation.forEach(uOV => {
        if (clonedAssignedUsersObj[uOV]) {
            let replacementForUserOnVacation = replacements[uOV]
            if (replacementForUserOnVacation) {
                clonedAssignedUsersObj[uOV] = replacementForUserOnVacation
            }
        }
    })
    return clonedAssignedUsersObj
}


const getDataToComputeTasksNotifications = (tasks, day, selectedBranch, usersOnVacation, user) => {
    return {
        tasks,
        selectedBranch,
        day,
        usersOnVacation,
				user
    }
}

const createDeepEqualTasksNotificationSelector = createSelectorCreator(
    defaultMemoize,
    (x, y) => {
			// console.log(x.tasks === y.tasks)
			// console.log(x.day === y.day)
			// console.log(x.selectedBranch.ID === y.selectedBranch.ID)
			// console.log(x.user.ID === y.user.ID)
			// console.log(x.usersOnVacaction === y.usersOnVacaction)
			// console.log("------------------------------------")
        return x.tasks === y.tasks
					&& x.day === y.day
					&& x.selectedBranch.ID === y.selectedBranch.ID
					&& x.user.ID === y.user.ID
					&& x.usersOnVacation === y.usersOnVacation
    }
)

const getNotificationsForUser = ({tasks, day, selectedBranch, usersOnVacation, user}) => {
	let forgottenTasksFromPast = getForgottenTasksFromPast(tasks, day, selectedBranch, usersOnVacation)
	let todaysTasksForUser = getTasksForDay({tasks, day: day, today: Date.create(day), selectedBranch, usersOnVacation})
	return filterTasksForUser(
		[...forgottenTasksFromPast, ...todaysTasksForUser],
		user
	).length
}

// --------------- SELECTORS
export function makeGetTasksNotificationsForUser() {
    return createDeepEqualTasksNotificationSelector([getDataToComputeTasksNotifications], getNotificationsForUser);
}

export function makeGetTasksForDay() {
    return createDeepEqualTasksDaySelector([getDataToComputeTasksForDay], getTasksForDay);
}

export const getForgottenTasksFromPast = createDeepEqualForgottenTasksSelector([getDataToComputeForgottonTasks], (props) => {
	// window.counter = Date.create();
	// window.testing = true
	const today = Date.create(props.day)
	// In this step its just a range of numbers that we are going to substract from the "heute" date to get the past days
	let tasksForDaysArray = _.range(1, 31)
	return tasksForDaysArray.map((i) => {
		let d = Date.create(props.day).addDays(-i).iso()
		return makeGetTasksForDay()(props.tasks, d, props.selectedBranch, today, props.usersOnVacaction, true, true)
	}).flatten()
})
