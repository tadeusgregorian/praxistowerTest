import {TaskType} from '../containers/apps/tasks/modals/addEditTaskWizardSteps/constants'
import _ from 'lodash';

const weekSorter = {
	"Mo":1,
	"Di":2,
	"Mi":3,
	"Do":4,
	"Fr":5,
	"Sa":6,
	"So":7
}

export function filterUsersByGroup(users, groupID) {
	let filteredUsers = users.filter((user) => {groupID;
		return user.assignedGroups && user.assignedGroups[groupID];
	});
	return filteredUsers ? filteredUsers : [];
}

export function filterUsersByBranch(users, branchID) {
	let filteredUsers = users.filter((user) => {branchID;
		return user.branches && user.branches[branchID];
	});
	return filteredUsers ? filteredUsers : [];
}

export function getUserById(users, userID) {
	return users.find(u => u.ID == userID);
}

export const filterTasksForUser = (tasks, user) => {
	// console.log("not exiting")
	return tasks.filter(t => !user || (!!_.values(t.assignedUsers).filter(auID => auID == user.ID).length))
}

export const getTypeAndPatternOfTask = (task) => {
		let r = {}
		switch (task.type) {
			case TaskType.onetimer:
			case "0": {		// crazyBugfix: for a while there was "0" written into DB instead of 0 .

				if(task.isDeadline){
					r.type = "Deadline "
				}else{
					r.type = "Einmalig "
				}
				r.pattern = Date.create(task.onetimerDate).format("{dd}. {Mon} {yyyy}")
				break
			}
			case TaskType.weekly: {
				r.type = task.repeatEvery ?  `alle ${task.repeatEvery} Wochen` : "Wöchentlich "

			  let sortedWeekdays = task.weekly && [ ...task.weekly ].sort((a,b) =>  {
					return (weekSorter[a] > weekSorter[b])
				})
				r.pattern = sortedWeekdays.join("  ")
				break
			}
			case TaskType.monthly: {
				r.type =  task.repeatEvery ?  `alle ${task.repeatEvery} Monate` : "Monatlich "
				let sortedMonthDays = task.monthly && [...task.monthly].sort((a,b) => a > b )
				r.pattern = "am " + sortedMonthDays.map(date => date + ".").join("  ")
				break
			}
			case TaskType.daily: {
				r.type =  "Täglich"
				r.pattern =  	((task.inculdeSaturday || task.includeSunday ) ? " inkl." : "" ) +
								( task.includeSaturday ? " SA " : "" ) +
								( task.includeSunday ? " SO" : "" )
				break
			}
			case TaskType.yearly: {
				r.type = task.repeatEvery ?  `alle ${task.repeatEvery} Jahre` : "Jährlich"
				r.patternFullLength = task.yearly && task.yearly.map( d => Date.create(d).format("{dd} {Mon}") ).join(" ,  ")
				if( task.yearly.length >= 4 ){
					r.pattern = task.yearly && task.yearly.at([0,1,2,3]).map( d => Date.create(d).format("{dd} {Mon}") ).join(" ,  ")+" , ..."
				}else{
					r.pattern = r.patternFullLength;
				}
				break
			}
			case TaskType.irregular: {
				r.type =  "Multi-Datum"
				r.patternFullLength = task.irregularDates && task.irregularDates.map( date =>  Date.create(date).format("{dd}.{Mon} {yyyy}")).join(" ,  ")
				if( task.irregularDates.length >= 3 ){
					r.pattern = task.irregularDates && task.irregularDates.at([0,1,2]).map( date =>  Date.create(date).format("{dd}.{Mon} {yyyy}")).join(" ,  ") +" , ..."
				}else{
					r.pattern = r.patternFullLength;
				}
				break
			}
			default: {
				r.type =  ""
				r.pattern = ""
				r.patternFullLength = null
			}
		}
		return r;
	}
