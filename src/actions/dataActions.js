export * from './firebaseListenerActions';
import {push} from 'react-router-redux';
import FBInstance from '../firebaseInstance';
import {createGuid} from 'helpers/index';
import _ from 'lodash';

// Put your firebase DB manipulations in here

export function deleteGroup(groupID, callback) {
	return dispatch => {
		return FBInstance.database().ref('groups').child(groupID).remove().then(function() {
			callback();
		}).catch(function(error) {
			console.log(error);
		})
	}
}

export function addNewGroup(groupName, callback) {
	let group = {
		ID: createGuid(),
		name: groupName
	};
	return dispatch => {
		return FBInstance.database().ref('groups').child(group.ID).set(group, callback);
	};
}

export function addUserToGroup(userID, groups, callback) {
	return dispatch => {
		return FBInstance.database().ref('users').child(userID).child('assignedGroups').set(groups, callback);
	};
}

export function removeUserFromGroup(groupID, userID, callback) {
	return dispatch => {
		return FBInstance.database().ref('users').child(userID).child('assignedGroups').child(groupID).remove().then(function() {
			callback();
		}).catch(function(error) {});
	};
}

export function deleteBranch(branchID, callback) {
	return dispatch => {
		return FBInstance.database().ref('branches').child(branchID).remove().then(function() {
			callback();
		}).catch(function(error) {});
	}
}

export function addNewBranch(branchName, callback) {
	let branch = {
		ID: createGuid(),
		name: branchName
	};
	return dispatch => {
		return FBInstance.database().ref('branches').child(branch.ID).set(branch, callback);
	};
}

export function addUserToBranch(userID, branches, callback) {
	return dispatch => {
		return FBInstance.database().ref('users').child(userID).child('branches').set(branches, callback);
	};
}

export function removeUserFromBranch(branchID, userID, callback) {
	return dispatch => {
		return FBInstance.database().ref('users').child(userID).child('branches').child(branchID).remove().then(function() {
			callback();
		}).catch(function(error) {});
	};
}

export function deleteUser(userID, callback) {
	return dispatch => {
		return FBInstance.database().ref('users').child(userID).remove(callback);
	};
}

export function editUser(user, callback) {
	return dispatch => {
		return FBInstance.database().ref('users').child(user.ID).set(user, callback);
	};
}

export function addTaskComment(taskID, creatorID, text) {
	const ID = createGuid()
	const date = Date.create().iso()
	const dateString = Date.create().shortISO()
	const commentData = {
		ID,
		date,
		creatorID,
		text,
		dateString
	}
	return dispatch => {
		return FBInstance.database().ref('tasks').child(taskID).child("comments").child(ID).set(commentData)
	};
}

export function editTaskReplacemnt(taskID, replacedUserID, replacedByUserID, callback) {
	return dispatch => {
		return FBInstance.database().ref('tasks').child(taskID).child('replacements').child(replacedUserID).set(replacedByUserID, callback);
	};
}

export function deleteTaskReplacement(taskID, replacedUserID) {
	return dispatch => {
		return FBInstance.database().ref('tasks').child(taskID).child('replacements').child(replacedUserID).remove();
	};
}

export function addNewUser(_user, callback) {
	let user = {
		..._user,
		ID: createGuid(),
		isOnVacation: false,
	}
	return dispatch => {
		return FBInstance.database().ref('users').child(user.ID).set(user, callback);
	};
}

export function changeVacationStatusOfUser(userID, isOnVacation, callback) {
	return dispatch => {
		return FBInstance.database().ref('users').child(userID).child('isOnVacation').set(isOnVacation).then(function(){
				callback(isOnVacation)
			}
		).catch( function(error) { console.log(error) })
	}
}

export function readQm(qmID, userID, callback) {
	return dispatch => {
		return FBInstance.database().ref('qmList').child(qmID).child('usersRed').child(userID).set(userID, () => {
			dispatch({type: 'READ_QM'});
			callback && callback();
		});
	};
}

export function checkTask(taskID, dateString, checkerID) {

	let checkedTask = {
		date: Date.create().iso(),
		checkerID: checkerID
	};

	return (dispatch, getStore) => {
		//
		//
		let clonedTaskForeOptimisticSaving = _.cloneDeep(getStore().data.tasks.find(t => t.ID == taskID));
		if (!clonedTaskForeOptimisticSaving.hasOwnProperty("checked")) {
			clonedTaskForeOptimisticSaving.checked = {}
		}

		clonedTaskForeOptimisticSaving.checked[dateString] = checkedTask
		dispatch({
			type: 'C_CHANGED_' + "tasks",
			payload: clonedTaskForeOptimisticSaving
		});
		return FBInstance.database().ref('tasks').child(taskID).child('checked').child(dateString).set(checkedTask)
	};
}

export function checkTaskStatic(taskID, dateString, checkerID) {
	let checkedTask = {
		date: Date.create().iso(),
		checkerID: checkerID
	};
	return FBInstance.database().ref('tasks').child(taskID).child('checked').child(dateString).set(checkedTask)
}

export function ignoreTask(taskID, dateString, checkerID) {
	let ignoredTask = {
		date: Date.create().iso(),
		checkerID: checkerID
	};
	return dispatch => {
		return FBInstance.database().ref('tasks').child(taskID).child('ignored').child(dateString).set(ignoredTask);
	};
}

export function updateTask(task) {
	return dispatch => {
		// by this we clean up the object (removing properties with undefined)
		removeUndefinedProperties(task);
		return FBInstance.database().ref('tasks').child(task.ID).set(task);
	};
}

export function shiftTaskOnce(task, dateString, newDate) {
	let onetimerCopy = _.cloneDeep(task)
	const newDateString = newDate.shortISO()
	// we create a new onetimer for the shifting
	onetimerCopy.hasOwnProperty("includeSaturday") && delete onetimerCopy.includeSaturday
	onetimerCopy.hasOwnProperty("includeSunday") && delete onetimerCopy.includeSunday
	onetimerCopy.hasOwnProperty("weekly") && delete onetimerCopy.weekly
	onetimerCopy.hasOwnProperty("monthly") && delete onetimerCopy.monthly
	onetimerCopy.hasOwnProperty("irregularDates") && delete onetimerCopy.irregularDates
	onetimerCopy.hasOwnProperty("yearly") && delete onetimerCopy.yearly

	onetimerCopy.hasOwnProperty("alertDaysBeforeDeadline") && delete onetimerCopy.alertDaysBeforeDeadline
	onetimerCopy.hasOwnProperty("repeatEvery") && delete onetimerCopy.repeatEvery
	onetimerCopy.hasOwnProperty("preponeSunday") && delete onetimerCopy.preponeSunday
	onetimerCopy.hasOwnProperty("preponeSaturday") && delete onetimerCopy.preponeSaturday
	onetimerCopy.hasOwnProperty("preponeHoliday") && delete onetimerCopy.preponeHoliday
	onetimerCopy.hasOwnProperty("endDate") && delete onetimerCopy.endDate;
	onetimerCopy.type = 0 // Setting to onetimer
	onetimerCopy.onetimerDate = newDateString
	onetimerCopy.originalShiftedTask = {
		date: dateString,
		ID: task.ID
	}
	let oldTaskWithFlag = _.cloneDeep(task)
	onetimerCopy.hasOwnProperty("isDeadline") && delete onetimerCopy.deadline
	if (!oldTaskWithFlag.hasOwnProperty("shifted")) {
		oldTaskWithFlag.shifted = {}
	}
	let shiftedDateString = oldTaskWithFlag.isDeadline
		? oldTaskWithFlag.onetimerDate
		: dateString
	oldTaskWithFlag.shifted[shiftedDateString] = newDateString
	return () => Promise.all([
		updateTask(oldTaskWithFlag)(),
		createTask(onetimerCopy)()
	])
}

export function unignoreTask(taskID, dateString) {
	return dispatch => {
		return FBInstance.database().ref('tasks').child(taskID).child('ignored').child(dateString).remove();
	};
}

export function uncheckTask(taskID, dateString) {
	return dispatch => {
		return FBInstance.database().ref('tasks').child(taskID).child('checked').child(dateString).remove();
	};
}

export function unreadQm(qmID, userID, callback) {
	return dispatch => {
		return FBInstance.database().ref('qmList').child(qmID).child('usersRed').child(userID).remove(() => {
			dispatch({type: 'UNREAD_QM'});
			callback && callback();
		});
	};
}

export function createQm(qmData) {
	let qm = Object.assign(qmData, {
		date: Date.create().iso(),
		ID: createGuid()
	});
	return dispatch => {
		return FBInstance.database().ref('qmList').child(qm.ID).set(qm);
	};
}

export function editQm(qm, callback) {
	return dispatch => {
		return FBInstance.database().ref('qmList').child(qm.ID).set(qm, callback);
	};
}

const removeUndefinedProperties = (obj) => {
	for (let i in obj) {
		if (typeof obj[i] == "undefined") {
			delete obj[i];
		}
	}
}

export function createTask(taskData) {
	let task = {
		...taskData,
		creationDate: taskData.creationDate || Date.create().iso(),  // when editing a Task, the taskData object contains the creationDate of the original Task, so we want to keep that one.
		ID: createGuid()
	}

	removeUndefinedProperties(task);
	return dispatch => {
		return FBInstance.database().ref('tasks').child(task.ID).set(task);
	};
}

export function deleteTask(taskID) {
	return dispatch => {
		return FBInstance.database().ref('tasks').child(taskID).remove();
	};
}

export function deleteQm(qmID, callback) {
	return dispatch => {
		return FBInstance.database().ref('qmList').child(qmID).remove(callback);
	};
}

export function authenticate(username, password, onSuccess, onFail) {
	return dispatch => {
		return FBInstance.auth().signInWithEmailAndPassword(username + '@mail.de', password).then((authData) => onSuccess && onSuccess()).catch(e => onFail && onFail(e));
	};
}

export function fixColors(userID, colorHash) {
	return dispatch => {
		return FBInstance.database().ref('users').child(userID).child('color').set(colorHash);
	};
}
