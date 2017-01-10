export function addBusy() {
	return { type: 'ADD_BUSY' };
}

export function removeBusy() {
	return { type: 'REMOVE_BUSY' };
}

export function openSelectUser() {
	return { type: 'OPEN_SELECT_USER' };
}

export function closeSelectUser() {
	return { type: 'CLOSE_SELECT_USER' };
}

export function selectBranch(branch) {
	localStorage.setItem('branch', JSON.stringify(branch));
	return {type: 'SELECT_BRANCH', payload: branch};
}

export function adminLoggedIn() {
	return {type: 'ADMIN_LOGGED_IN'}
}

export function adminLoggedOut() {
	return {type: 'ADMIN_LOGGED_OUT'}
}
