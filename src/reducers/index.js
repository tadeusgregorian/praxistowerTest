import {combineReducers} from 'redux';
import {
	qmLetters,
	users,
	groups,
	isTryingToAuth,
	tasks,
	branches,
	qmLettersListenerSet,
	usersListenerSet,
	groupsListenerSet,
	tasksListenerSet,
	branchesListenerSet
} from './data';
import routesPermissions from './routesPermissionsReducer';
import auth from './authReducer';
import {busy, selectedBranch, adminLoggedIn} from './core';
import {routerReducer} from 'react-router-redux'


const rootReducer = combineReducers({
	routing: routerReducer,
	routesPermissions,
	auth,
	data: combineReducers({
		qmLetters,
		tasks,
		branches,
		users,
		groups,
		isTryingToAuth,
		listenersSet: combineReducers({qmLettersListenerSet, usersListenerSet, groupsListenerSet, tasksListenerSet, branchesListenerSet})
	}),
	core: combineReducers({busy, selectedBranch, adminLoggedIn}),
});

export default rootReducer;
