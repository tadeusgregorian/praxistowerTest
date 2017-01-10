import { createSelector } from 'reselect';

const getUsers = (state) => {
    return state.data.users
}

export const getUsersOnVacation = createSelector([getUsers], (users) => {
    let usersOnVacation = users.filter(u => u.isOnVacation).map(u => u.ID)
    return usersOnVacation
})
