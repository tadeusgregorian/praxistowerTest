import _ from 'lodash';


export const auth = (state = null, action) => {
	switch (action.type) {
	case 'AUTH': return action.payload;
	default: return state;
	}
};

export const isTryingToAuth = (state = true, action) => {
	switch (action.type) {
	case 'IS_TRYING_TO_AUTH': return action.payload;
	default: return state;
	}
};

const createFirebaseDataReducer = (ref) => {
	return (state = [], action) => {
		switch (action.type) {
			case 'VALUE_RECEIVED_' + ref: {
				return [..._.values(action.payload)];
			}
			case 'C_ADDED_' + 	ref: {
				if (!state.find(i => i.ID == action.payload.ID)) {
					return [...state, action.payload];
				}
				let a = [...state];
				let o = _.indexOf(a, state.find(i => i.ID == action.payload.ID));
				return a.splice(o, 1, action.payload);
			}
			case 'C_CHANGED_' + ref:
				var x = state.map(d => d.ID == action.payload.ID ? action.payload : d);
				
				return x;
			case 'C_REMOVED_' + ref: return state.filter(d => d.ID != action.payload.ID);
			default: return state;
		}
	};
};

export const qmLetters = createFirebaseDataReducer('qmList');
export const users = createFirebaseDataReducer('users');
export const groups = createFirebaseDataReducer('groups');
export const tasks = createFirebaseDataReducer('tasks');
export const branches = createFirebaseDataReducer('branches');

const createFirebaseListenerSetReducer = (ref) => {
	return (state = false, action) => {
		switch (action.type) {
		case ref + '_LISTENER_SET': return true;
		default: return state;
		}
	};
};

export const qmLettersListenerSet = createFirebaseListenerSetReducer('qmList');
export const usersListenerSet = createFirebaseListenerSetReducer('users');
export const groupsListenerSet = createFirebaseListenerSetReducer('groups');
export const tasksListenerSet = createFirebaseListenerSetReducer('tasks');
export const branchesListenerSet = createFirebaseListenerSetReducer('branches');
