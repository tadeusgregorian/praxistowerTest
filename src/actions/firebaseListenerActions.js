import FBInstance from '../firebaseInstance';

const createFirebaseDataListener = (ref) => {
	return () => {
		return (dispatch) => {
			dispatch({
				type: ref + '_LISTENER_SET'
			});
			let initialValueLoaded = false
			FBInstance.database().ref(ref).on('child_added', snapshot => {
				if (initialValueLoaded) {
					dispatch({
						type: 'C_ADDED_' + ref,
						payload: snapshot.val()
					});
				}
			});
			return FBInstance.database().ref(ref).once('value', snapshot => {
				if (!initialValueLoaded) {
					dispatch({
						type: 'VALUE_RECEIVED_' + ref,
						payload: snapshot.val()
					});
					initialValueLoaded = true
				}
			}).then(() => {
				FBInstance.database().ref(ref).on('child_changed', snapshot => {
					dispatch({
						type: 'C_CHANGED_' + ref,
						payload: snapshot.val()
					});
				});
				FBInstance.database().ref(ref).on('child_removed', snapshot => {
					dispatch({
						type: 'C_REMOVED_' + ref,
						payload: snapshot.val()
					});
				});
			});
		};
	};
};

// Register your Firebase Listeners here and the reducers in reducers/data.js + reducers/index.js
export const registerQmLettersDataListener = createFirebaseDataListener('qmList');
export const registerUsersDataListener = createFirebaseDataListener('users');
export const registerGroupsDataListener = createFirebaseDataListener('groups');
export const registerTasksDataListener = createFirebaseDataListener('tasks');
export const registerBranchesDataListener = createFirebaseDataListener('branches');

// Special Authentication Listener
export const setIsTryingToAuth = (b) => {
	return {
		type: 'IS_TRYING_TO_AUTH',
		payload: b
	};
};

export const registerAuthListener = (onAuth) => {
	return dispatch => {
		dispatch({
			type: 'AUTH_LISTENER'
		});
		FBInstance.auth().onAuthStateChanged((user) => {
			let userData = user && {
				uid: user.uid,
				email: user.email,
				displayName: user.displayName
			};
			dispatch({
				type: 'AUTH',
				payload: userData
			});
			onAuth(userData);
		});
	};
};
