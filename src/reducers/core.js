import _ from 'lodash';

// this is a global busy!
export const busy = (state = false, action) => {
	switch (action.type) {
		case 'ADD_BUSY':
			return true;
		case 'REMOVE_BUSY':
			return false;
		default:
			return state;
	}
};

export const selectedBranch = (state = (localStorage.branch && JSON.parse(localStorage.branch)) || null, action) => {
	switch (action.type) {
		case 'SELECT_BRANCH':
			return action.payload;
		default:
			return state;
	}
}

export const adminLoggedIn = (state = false, action) => {
	switch (action.type) {
		case 'ADMIN_LOGGED_IN':
			return true;
		case 'ADMIN_LOGGED_OUT':
			return false;
		default:
			return state;
	}
}
