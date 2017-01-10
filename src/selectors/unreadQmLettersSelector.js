import { createSelector } from 'reselect';
import _ from 'lodash';

const getUsers = (state) => {
    return state.data.users
}

const getQms = (state) => {
	return state.data.qmLetters
}

export const getUnreadQmLetters = createSelector([ getUsers, getQms ], (users, qmLetters) => {
	  let rObj = {}
		let rArr = users.map( u => {
							let qmNotifications = qmLetters.filter( qm => !!_.values(qm.assignedUsers).find(auID => auID == u.ID) &&
							!_.values(qm.usersRed).find(urID => urID == u.ID) &&
							qm.creatorID != u.ID).length;

							rObj[u.ID] = qmNotifications;
							return { [u.ID]:qmNotifications  }
		})
		return rObj
})
