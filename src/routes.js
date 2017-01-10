import React, {Component} from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {Router, Route, hashHistory, Redirect, IndexRoute} from 'react-router'
import {compose} from 'redux'
import thunk from 'redux-thunk'
import {requireAuth, requireAdmin} from 'actions/authActions'
import AdminPanel from './containers/apps/adminPanel'
import EditBranches from './containers/apps/adminPanel/branches'
import EditGroups from './containers/apps/adminPanel/groups'
import EditUsers from './containers/apps/adminPanel/users'
import Apps from './containers/apps'
import QmApp from './containers/apps/qm'
import QmLetters from './containers/apps/qm/letters'
import EditCreatedTasks from './containers/apps/tasks/editing/created'
import Tasks from './containers/apps/tasks/calendar'
import TasksApp from './containers/apps/tasks'
import TasksEdit from './containers/apps/tasks/editing'
import Login from './containers/login'
import FirebaseApi from './firebaseApi'
import rootReducer from './reducers'

const checkAuth = (nextState, replace, callback) => {
	window.store.dispatch(requireAuth(nextState, replace, callback));
};

const checkAdmin = (nextState, replace, callback, force) => {
	// checking wether admin login is needed
	if (window.store.getState().auth.isLogged) {
		if (nextState.params.id) {
			if (window.store.getState().data.users.length) {
				let currentUser = window.store.getState().data.users.find(u => u.ID == nextState.params.id)
				if (currentUser.adminHash) {
					window.store.dispatch(requireAdmin(nextState, replace, callback, currentUser.adminHash));
				} else {
					callback();
				}
			} else {
				FirebaseApi.GetValueByKeyOnce("users", nextState.params.id).then((u) => {
					let currentUser = u.val()[nextState.params.id]
					if (currentUser.adminHash) {
						window.store.dispatch(requireAdmin(nextState, replace, callback, currentUser.adminHash));
					} else {
						callback();
					}
				})
			}
		} else if (!force) {
			callback();
		} else if (force && window.store.getState().core.adminLoggedIn) {
			callback();
		} else {
			window.store.dispatch(requireAdmin(nextState, replace, callback, ""));
		}
	} else {
		window.store.dispatch(requireAuth(nextState, replace));
	}
};

const routes = {
	path: "/",
	indexRoute: {
		onEnter: (nextState, replace : any) => replace(`/Apps/Tasks`)
	},
	childRoutes: [
		{
			path: "Apps",
			component: Apps,
			onEnter: checkAuth,
			childRoutes: [
				{
					path: "Qm(/:id)",
					onlyForSelectedUser: true,
					name: "QM",
					component: QmApp,
					indexRoute: {
						component: QmLetters,
						onEnter: (nextState, replace, callback) => checkAdmin(nextState, replace, callback, false)
					}
				}, {
					path: "Tasks(/:id)",
					name: "Aufgaben",
					onEnter: (nextState, replace, callback) => checkAdmin(nextState, replace, callback, false),
					component: TasksApp,
					indexRoute: {
						component: Tasks
					},
					childRoutes: [
						{
							path: "Edit",
							component: TasksEdit,
							indexRoute: {
								onEnter: (nextState, replace : any) => replace(`/Apps/Tasks/${nextState.params.id}/Edit/CreatedTasks`)
							},
							childRoutes: [
								{
									path: "CreatedTasks",
									component: EditCreatedTasks
								}
							]
						}
					]
				}, {
					path: "Adminpanel(/:id)",
					name: "Adminpanel",
					component: AdminPanel,
					onlyForAdmin: true,
					onEnter: (nextState, replace, callback) => checkAdmin(nextState, replace, callback, false),
					indexRoute: {
						onEnter: (nextState, replace : any) => replace(`/Apps/Adminpanel/${nextState.params.id}/Users`)
					},
					childRoutes: [
						{
							path: "Users",
							component: EditUsers
						}, {
							path: "Branches",
							component: EditBranches
						}, {
							path: "Groups",
							component: EditGroups
						}
					]
				}
			]
		}, {
			path: "Login",
			component: Login
		}
	]
}

export default routes;
