import {push} from 'react-router-redux'
import toastr from 'toastr'
import FirebaseApi from '../firebaseApi'

export function authLoggedOut() {

	return {type: "AUTH_LOGGED_OUT"};
}

export function authInitialized(user) {
	return (dispatch) => {
		dispatch({type: "AUTH_INITIALIZED"});
		if (user) {
			dispatch(authLoggedIn(user.uid));
		} else {
			dispatch(authLoggedOut());
		}
	};
}

export function authLoggedIn(userUID) {
	return (dispatch) => {
		dispatch({type: "AUTH_LOGGED_IN", userUID});
	};
}

export function signInWithEmailAndPassword(user) {
	return (dispatch) => {
		return FirebaseApi.signInWithEmailAndPassword(user).then(user => {
			dispatch(authLoggedIn(user.uid));
		}).catch(error => {
			// @TODO better error handling
			throw(error);
		});
	};
}

export function signOut() {

	return (dispatch, getState) => {
		return FirebaseApi.authSignOut().then(() => {
			dispatch(authLoggedOut());
			if (getState().routesPermissions.requireAuth.filter(route => getState().routing.locationBeforeTransitions.pathname.includes(route)).toString()) {
				dispatch(push('/login'));
			}
		}).catch(error => {
			// @TODO better error handling
			throw(error);
		});
	};
}

function redirect(replace, pathname, nextPathName, error = false, callback) {
	replace({
		pathname: pathname,
		state: {
			nextPathname: nextPathName
		}
	});

	if (error) {
		toastr.error(error);
	}
	callback();
}

export function requireAuth(nextState, replace, callback) {
	return (dispatch, getState) => {
		if (!getState().auth.isLogged) {
			if (!getState().auth.initialized) {
				FirebaseApi.initAuth().then(user => {
					dispatch(authInitialized(user))
					if (user) {
						callback();
					} else {
						redirect(replace, '/login', nextState.location.pathname, 'You need to be logged to access this page', callback);
					}
				});
			} else {
				redirect(replace, '/login', nextState.location.pathname, 'You need to be logged to access this page', callback);
			}
		} else {
			callback();
		}
	};
}

export function requireAdmin(nextState, replace, callback, adminHash) {
	return (dispatch, getState) => {
		if (adminHash == sessionStorage.getItem("adminHash")) {

			callback();
		} else {

			redirect(replace, '/apps/tasks', nextState.location.pathname, 'You need to have admin rights to access this page!', callback);
		}
	};
}
